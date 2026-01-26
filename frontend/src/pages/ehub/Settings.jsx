import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { X, CreditCard, User, Lock, Check, Loader2, Download, Receipt } from 'lucide-react';
import Paystack from '@paystack/inline-js';

export default function Settings({ isOpen, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [updating, setUpdating] = useState(false);

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const plans = [
    { 
      id: 'monthly', 
      name: 'Monthly Plan', 
      price: 1700, 
      duration: 30, 
      description: 'Perfect for getting started',
      features: ['Access all courses', 'Certificate of completion', 'Community support']
    },
    { 
      id: 'quarterly', 
      name: '3-Month Plan', 
      price: 5000, 
      duration: 90, 
      description: 'Best value for committed learners',
      features: ['Everything in Monthly', 'Priority support', 'Save KES 100'],
      popular: true
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || user.email || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { 
        firstName, 
        lastName, 
        email 
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setUpdating(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.code === 'auth/wrong-password' 
          ? 'Current password is incorrect' 
          : 'Failed to change password' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePayWithPaystack = () => {
    const popup = new Paystack();
    popup.newTransaction({
      key: paystackPublicKey,
      email: email,
      amount: selectedPlan.price * 100,
      currency: 'KES',
      onSuccess: (transaction) => handlePaymentSuccess(transaction),
      onCancel: () => {
        setShowPaymentModal(false);
        console.log('Payment cancelled');
      }
    });
  };

  const handlePaymentSuccess = async (reference) => {
    try {
      const now = new Date();
      const endDate = new Date(now.getTime() + selectedPlan.duration * 24 * 60 * 60 * 1000);
      const payment = { 
        id: reference.reference, 
        amount: selectedPlan.price, 
        currency: 'KES', 
        date: now, 
        status: 'success', 
        plan: selectedPlan.name,
        planId: selectedPlan.id
      };
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const existingPayments = userDoc.data()?.payments || [];

      await updateDoc(userRef, {
        subscription: { 
          status: 'active', 
          plan: selectedPlan.id, 
          startDate: now, 
          endDate: endDate, 
          amount: selectedPlan.price 
        },
        payments: [...existingPayments, payment]
      });
      
      setShowPaymentModal(false);
      setMessage({ type: 'success', text: 'Subscription activated successfully!' });
      fetchUserData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update subscription record.' });
    }
  };

  const isSubscriptionActive = () => {
    if (!userData?.subscription?.endDate) return false;
    const end = userData.subscription.endDate.toDate 
      ? userData.subscription.endDate.toDate() 
      : new Date(userData.subscription.endDate);
    return end > new Date();
  };

  const getDaysRemaining = () => {
    if (!userData?.subscription?.endDate) return 0;
    const end = userData.subscription.endDate.toDate 
      ? userData.subscription.endDate.toDate() 
      : new Date(userData.subscription.endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const downloadReceipt = (payment) => {
    // Simple receipt download - can be enhanced with PDF generation
    const receiptText = `
RECEIPT
=====================================
Date: ${new Date(payment.date.toDate ? payment.date.toDate() : payment.date).toLocaleDateString()}
Transaction ID: ${payment.id}
Plan: ${payment.plan}
Amount: ${payment.currency} ${payment.amount}
Status: ${payment.status}
=====================================
Thank you for your payment!
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.id}.txt`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <nav className="w-full md:w-64 border-r bg-gray-50 p-4 space-y-2 overflow-y-auto">
            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'subscription', label: 'Subscription', icon: CreditCard },
              { id: 'receipts', label: 'Receipts', icon: Receipt },
              { id: 'security', label: 'Security', icon: Lock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Message Alert */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                  <span className="font-medium">{message.text}</span>
                </div>
                <button onClick={() => setMessage({type:'', text:''})}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)} 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)} 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={updating}
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Subscription</h3>
                
                {/* Current Status */}
                <div className={`p-6 rounded-2xl mb-8 ${
                  isSubscriptionActive() 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Current Status</h4>
                      {isSubscriptionActive() ? (
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-green-700 font-semibold">
                            <Check className="w-5 h-5"/> Active Subscription
                          </p>
                          <p className="text-sm text-gray-600">
                            Plan: <span className="font-semibold">{userData?.subscription?.plan}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires: <span className="font-semibold">
                              {userData.subscription.endDate.toDate 
                                ? userData.subscription.endDate.toDate().toLocaleDateString() 
                                : new Date(userData.subscription.endDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">No active subscription</p>
                      )}
                    </div>
                    {isSubscriptionActive() && (
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">{getDaysRemaining()}</p>
                        <p className="text-sm text-gray-600">days left</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plans */}
                <h4 className="font-bold text-gray-900 mb-4">Choose a Plan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map(plan => (
                    <div 
                      key={plan.id} 
                      className={`p-6 border-2 rounded-2xl transition-all cursor-pointer hover:shadow-lg ${
                        plan.popular 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => { setSelectedPlan(plan); setShowPaymentModal(true); }}
                    >
                      {plan.popular && (
                        <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full mb-3">
                          POPULAR
                        </span>
                      )}
                      <h5 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h5>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">KES {plan.price}</span>
                        <span className="text-gray-600">/{plan.duration} days</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all">
                        Subscribe Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Receipts Tab */}
            {activeTab === 'receipts' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : userData?.payments && userData.payments.length > 0 ? (
                  <div className="space-y-3">
                    {userData.payments.slice().reverse().map((payment, idx) => (
                      <div 
                        key={idx} 
                        className="p-5 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                              <Receipt className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{payment.plan || payment.planId}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Transaction ID: <span className="font-mono text-xs">{payment.id}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.date.toDate ? payment.date.toDate() : payment.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              {payment.currency} {payment.amount}
                            </p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </span>
                            <button
                              onClick={() => downloadReceipt(payment)}
                              className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-black font-semibold transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No payments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Your payment history will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" 
                      required
                      minLength={6}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={updating}
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{selectedPlan.name}</h3>
              <p className="text-gray-600 mb-6">{selectedPlan.description}</p>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-gray-600 text-sm mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-gray-900">KES {selectedPlan.price}</p>
                <p className="text-sm text-gray-500 mt-1">for {selectedPlan.duration} days</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePayWithPaystack} 
                  className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}