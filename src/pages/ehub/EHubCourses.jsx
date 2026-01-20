    import { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { auth, db } from '../../firebase';
    import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

    function EHubCourses() {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const navigate = useNavigate();

    // Course data - in future you can fetch this from Firestore
    const courses = [
        {
        id: 'professional-foundations',
        title: 'Professional Foundations',
        description: 'Build essential skills for a successful career in technology.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
        id: 'frontend-dev',
        title: 'Front End Web Development',
        description: 'Learn to create stunning user interfaces with HTML, CSS, and JavaScript.',
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
        id: 'backend-dev',
        title: 'Backend Web Development',
        description: 'Master server-side technologies and database management.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
        id: 'tech-career',
        title: 'Tech Career & Freelancing',
        description: 'Strategies for building a tech career and succeeding as a freelancer.',
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
        id: 'mobile-dev',
        title: 'Mobile App Development',
        description: 'Develop cross-platform mobile applications with modern frameworks.',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
        const user = auth.currentUser;
        if (!user) {
            navigate('/login');
            return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setEnrolledCourses(userData.enrolledCourses || []);
        }
        } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
        setEnrolling(courseId);
        const user = auth.currentUser;
        
        if (!user) {
            navigate('/login');
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        
        // Add course to user's enrolledCourses array
        await updateDoc(userRef, {
            enrolledCourses: arrayUnion(courseId)
        });

        // Update local state
        setEnrolledCourses(prev => [...prev, courseId]);

        // Navigate to course details
        navigate(`/course/${courseId}`);
        } catch (error) {
        console.error('Error enrolling in course:', error);
        alert('Failed to enroll. Please try again.');
        } finally {
        setEnrolling(null);
        }
    };

    const handleViewDetails = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    const isEnrolled = (courseId) => {
        return enrolledCourses.includes(courseId);
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center py-16">
            <p className="text-gray-600">Loading courses...</p>
        </div>
        );
    }

    return (
        <section id="courses" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">My Courses</h2>
            <p className="text-center text-gray-600 mb-8">
            Enroll in courses and continue your learning journey.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                    
                    {/* Show enrolled badge if enrolled */}
                    {isEnrolled(course.id) && (
                    <div className="mt-3">
                        <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        ✓ Enrolled
                        </span>
                    </div>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                    {/* Enroll/Continue Button */}
                    <button onClick={() => navigate(`/learn/${course.id}`)}>
  Start Learning
</button>       
                    
                    {/* View Details Button */}
                    <button
                        onClick={() => handleViewDetails(course.id)}
                        className="px-4 py-2 rounded-md font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                        Details
                    </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        </section>
    );
    }

    export default EHubCourses;