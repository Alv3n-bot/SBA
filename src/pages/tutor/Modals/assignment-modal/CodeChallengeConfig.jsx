// assignment-modal/CodeChallengeConfig.jsx
import { useState } from 'react';
import { 
  FolderTree, 
  Trash2, 
  Plus, 
  Terminal, 
  Zap, 
  Code2, 
  Server, 
  Shield, 
  FileCheck 
} from 'lucide-react';

export default function CodeChallengeConfig({ formData, setFormData }) {
  // Required Files Management
  const addRequiredFile = () => {
    const newFiles = [...(formData.codeChecking.requiredFiles || []), { path: '' }];
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, requiredFiles: newFiles }
    });
  };

  const removeRequiredFile = (index) => {
    const newFiles = formData.codeChecking.requiredFiles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, requiredFiles: newFiles }
    });
  };

  const updateRequiredFile = (index, value) => {
    const newFiles = [...formData.codeChecking.requiredFiles];
    newFiles[index] = { path: value };
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, requiredFiles: newFiles }
    });
  };

  // Function Tests Management
  const addFunctionTest = () => {
    const newTests = [...(formData.codeChecking.functionTests || []), {
      functionName: '',
      inputs: '',
      expectedOutput: ''
    }];
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, functionTests: newTests }
    });
  };

  const removeFunctionTest = (index) => {
    const newTests = formData.codeChecking.functionTests.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, functionTests: newTests }
    });
  };

  const updateFunctionTest = (index, field, value) => {
    const newTests = [...formData.codeChecking.functionTests];
    newTests[index][field] = value;
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, functionTests: newTests }
    });
  };

  // Component Tests Management (React/Vue)
  const addComponentTest = () => {
    const newTests = [...(formData.codeChecking.componentTests || []), {
      methodName: '',
      description: '',
      inputs: '',
      expectedOutput: ''
    }];
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, componentTests: newTests }
    });
  };

  const removeComponentTest = (index) => {
    const newTests = formData.codeChecking.componentTests.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, componentTests: newTests }
    });
  };

  const updateComponentTest = (index, field, value) => {
    const newTests = [...formData.codeChecking.componentTests];
    newTests[index][field] = value;
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, componentTests: newTests }
    });
  };

  // API Endpoint Tests Management
  const addApiTest = () => {
    const newTests = [...(formData.codeChecking.apiTests || []), {
      method: 'GET',
      endpoint: '',
      expectedStatus: 200,
      description: ''
    }];
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, apiTests: newTests }
    });
  };

  const removeApiTest = (index) => {
    const newTests = formData.codeChecking.apiTests.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, apiTests: newTests }
    });
  };

  const updateApiTest = (index, field, value) => {
    const newTests = [...formData.codeChecking.apiTests];
    newTests[index][field] = value;
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, apiTests: newTests }
    });
  };

  // Security Tests Management
  const addSecurityTest = () => {
    const newTests = [...(formData.codeChecking.securityTests || []), {
      type: 'sql-injection',
      testInput: '',
      shouldBlock: true,
      description: ''
    }];
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, securityTests: newTests }
    });
  };

  const removeSecurityTest = (index) => {
    const newTests = formData.codeChecking.securityTests.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, securityTests: newTests }
    });
  };

  const updateSecurityTest = (index, field, value) => {
    const newTests = [...formData.codeChecking.securityTests];
    newTests[index][field] = value;
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, securityTests: newTests }
    });
  };

  // File Structure Tests Management
  const addFileStructureTest = () => {
    const newTests = [...(formData.codeChecking.fileStructureTests || []), {
      type: 'file-exists',
      path: '',
      description: ''
    }];
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, fileStructureTests: newTests }
    });
  };

  const removeFileStructureTest = (index) => {
    const newTests = formData.codeChecking.fileStructureTests.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, fileStructureTests: newTests }
    });
  };

  const updateFileStructureTest = (index, field, value) => {
    const newTests = [...formData.codeChecking.fileStructureTests];
    newTests[index][field] = value;
    setFormData({
      ...formData,
      codeChecking: { ...formData.codeChecking, fileStructureTests: newTests }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Code Challenge Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Set up GitHub integration and automated testing
        </p>
      </div>

      {/* Basic Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language *
          </label>
          <select
            value={formData.codeChecking.language}
            onChange={(e) => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, language: e.target.value }
            })}
            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="react">React (JSX)</option>
            <option value="nodejs">Node.js (Backend)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main File to Execute *
          </label>
          <input
            type="text"
            value={formData.codeChecking.mainFile}
            onChange={(e) => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, mainFile: e.target.value }
            })}
            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., solution.js"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required GitHub Repo Name *
        </label>
        <input
          type="text"
          value={formData.codeChecking.repoName}
          onChange={(e) => setFormData({
            ...formData,
            codeChecking: { ...formData.codeChecking, repoName: e.target.value }
          })}
          className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., assignment-calculator"
        />
      </div>

      {/* Required Files */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FolderTree className="w-4 h-4 text-gray-600" />
          <label className="block text-sm font-medium text-gray-700">
            Required Files
          </label>
        </div>
        {formData.codeChecking.requiredFiles?.map((file, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={file.path}
              onChange={(e) => updateRequiredFile(index, e.target.value)}
              className="flex-1 border-gray-300 rounded-lg text-sm"
              placeholder="e.g., src/calculator.js"
            />
            <button
              type="button"
              onClick={() => removeRequiredFile(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRequiredFile}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Required File
        </button>
      </div>

      {/* Testing Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Testing Type *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Console Output */}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, testingType: 'console-output' }
            })}
            className={`p-4 rounded-lg border-2 text-left transition ${
              formData.codeChecking.testingType === 'console-output'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Terminal className="w-5 h-5 mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900 text-sm">Console Output</div>
            <div className="text-xs text-gray-600 mt-1">
              Test stdout
            </div>
          </button>
          
          {/* Function Testing */}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, testingType: 'function-testing' }
            })}
            className={`p-4 rounded-lg border-2 text-left transition ${
              formData.codeChecking.testingType === 'function-testing'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Zap className="w-5 h-5 mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900 text-sm">Function Testing</div>
            <div className="text-xs text-gray-600 mt-1">
              Test returns
            </div>
          </button>

          {/* Component Testing */}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, testingType: 'component-testing' }
            })}
            className={`p-4 rounded-lg border-2 text-left transition ${
              formData.codeChecking.testingType === 'component-testing'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Code2 className="w-5 h-5 mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900 text-sm">Component Logic</div>
            <div className="text-xs text-gray-600 mt-1">
              React/Vue
            </div>
          </button>

          {/* API Testing */}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, testingType: 'api-testing' }
            })}
            className={`p-4 rounded-lg border-2 text-left transition ${
              formData.codeChecking.testingType === 'api-testing'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Server className="w-5 h-5 mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900 text-sm">API Endpoints</div>
            <div className="text-xs text-gray-600 mt-1">
              REST APIs
            </div>
          </button>

          {/* Security Testing */}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, testingType: 'security-testing' }
            })}
            className={`p-4 rounded-lg border-2 text-left transition ${
              formData.codeChecking.testingType === 'security-testing'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Shield className="w-5 h-5 mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900 text-sm">Security</div>
            <div className="text-xs text-gray-600 mt-1">
              Vulnerabilities
            </div>
          </button>

          {/* File Structure Testing */}
          <button
            type="button"
            onClick={() => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, testingType: 'file-structure' }
            })}
            className={`p-4 rounded-lg border-2 text-left transition ${
              formData.codeChecking.testingType === 'file-structure'
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileCheck className="w-5 h-5 mb-2 text-indigo-600" />
            <div className="font-medium text-gray-900 text-sm">File Structure</div>
            <div className="text-xs text-gray-600 mt-1">
              Project setup
            </div>
          </button>
        </div>
      </div>

      {/* Console Output Testing */}
      {formData.codeChecking.testingType === 'console-output' && (
        <div className="bg-blue-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Console Output *
          </label>
          <textarea
            value={formData.codeChecking.expectedOutput || ''}
            onChange={(e) => setFormData({
              ...formData,
              codeChecking: { ...formData.codeChecking, expectedOutput: e.target.value }
            })}
            className="w-full border-gray-300 rounded-lg"
            rows="3"
            placeholder="e.g., Hello World"
          />
          <p className="text-xs text-gray-600 mt-1">
            What the code should print to stdout
          </p>
        </div>
      )}

      {/* Function Testing */}
      {formData.codeChecking.testingType === 'function-testing' && (
        <div className="bg-purple-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Function Tests
          </label>
          {formData.codeChecking.functionTests?.map((test, index) => (
            <div key={index} className="bg-white rounded-lg p-3 mb-3 border border-purple-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={test.functionName}
                  onChange={(e) => updateFunctionTest(index, 'functionName', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="Function name (e.g., add)"
                />
                <input
                  type="text"
                  value={test.inputs}
                  onChange={(e) => updateFunctionTest(index, 'inputs', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="Inputs (e.g., 2, 3)"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={test.expectedOutput}
                  onChange={(e) => updateFunctionTest(index, 'expectedOutput', e.target.value)}
                  className="flex-1 border-gray-300 rounded text-sm"
                  placeholder="Expected output (e.g., 5)"
                />
                <button
                  type="button"
                  onClick={() => removeFunctionTest(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addFunctionTest}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Function Test
          </button>
        </div>
      )}

      {/* Component Testing (React/Vue) */}
      {formData.codeChecking.testingType === 'component-testing' && (
        <div className="bg-green-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Component Method Tests
          </label>
          {formData.codeChecking.componentTests?.map((test, index) => (
            <div key={index} className="bg-white rounded-lg p-3 mb-3 border border-green-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={test.methodName}
                  onChange={(e) => updateComponentTest(index, 'methodName', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="Method name (e.g., handleClick)"
                />
                <input
                  type="text"
                  value={test.inputs}
                  onChange={(e) => updateComponentTest(index, 'inputs', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="Inputs (e.g., event)"
                />
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={test.expectedOutput}
                  onChange={(e) => updateComponentTest(index, 'expectedOutput', e.target.value)}
                  className="flex-1 border-gray-300 rounded text-sm"
                  placeholder="Expected output"
                />
                <button
                  type="button"
                  onClick={() => removeComponentTest(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={test.description}
                onChange={(e) => updateComponentTest(index, 'description', e.target.value)}
                className="w-full border-gray-300 rounded text-sm"
                placeholder="Description (optional)"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addComponentTest}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Component Test
          </button>
          <p className="text-xs text-gray-600 mt-2">
            Test component methods and logic (not UI rendering)
          </p>
        </div>
      )}

      {/* API Endpoint Testing */}
      {formData.codeChecking.testingType === 'api-testing' && (
        <div className="bg-orange-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            API Endpoint Tests
          </label>
          {formData.codeChecking.apiTests?.map((test, index) => (
            <div key={index} className="bg-white rounded-lg p-3 mb-3 border border-orange-200">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <select
                  value={test.method}
                  onChange={(e) => updateApiTest(index, 'method', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <input
                  type="text"
                  value={test.endpoint}
                  onChange={(e) => updateApiTest(index, 'endpoint', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="/api/users"
                />
                <input
                  type="number"
                  value={test.expectedStatus}
                  onChange={(e) => updateApiTest(index, 'expectedStatus', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="200"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={test.description}
                  onChange={(e) => updateApiTest(index, 'description', e.target.value)}
                  className="flex-1 border-gray-300 rounded text-sm"
                  placeholder="Description (e.g., Returns all users)"
                />
                <button
                  type="button"
                  onClick={() => removeApiTest(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addApiTest}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add API Test
          </button>
        </div>
      )}

      {/* Security Testing */}
      {formData.codeChecking.testingType === 'security-testing' && (
        <div className="bg-red-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Security Tests
          </label>
          {formData.codeChecking.securityTests?.map((test, index) => (
            <div key={index} className="bg-white rounded-lg p-3 mb-3 border border-red-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={test.type}
                  onChange={(e) => updateSecurityTest(index, 'type', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                >
                  <option value="sql-injection">SQL Injection</option>
                  <option value="xss">XSS Attack</option>
                  <option value="csrf">CSRF Protection</option>
                  <option value="password-hash">Password Hashing</option>
                  <option value="jwt-validation">JWT Validation</option>
                  <option value="rate-limiting">Rate Limiting</option>
                  <option value="input-validation">Input Validation</option>
                </select>
                <input
                  type="text"
                  value={test.testInput}
                  onChange={(e) => updateSecurityTest(index, 'testInput', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="Test input"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={test.description}
                  onChange={(e) => updateSecurityTest(index, 'description', e.target.value)}
                  className="flex-1 border-gray-300 rounded text-sm"
                  placeholder="Description"
                />
                <button
                  type="button"
                  onClick={() => removeSecurityTest(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addSecurityTest}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Security Test
          </button>
        </div>
      )}

      {/* File Structure Testing */}
      {formData.codeChecking.testingType === 'file-structure' && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            File Structure Tests
          </label>
          {formData.codeChecking.fileStructureTests?.map((test, index) => (
            <div key={index} className="bg-white rounded-lg p-3 mb-3 border border-yellow-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={test.type}
                  onChange={(e) => updateFileStructureTest(index, 'type', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                >
                  <option value="file-exists">File Exists</option>
                  <option value="folder-exists">Folder Exists</option>
                  <option value="package-json">package.json Valid</option>
                  <option value="gitignore">`.gitignore` Exists</option>
                  <option value="readme">README.md Exists</option>
                  <option value="no-secrets">No Hardcoded Secrets</option>
                </select>
                <input
                  type="text"
                  value={test.path}
                  onChange={(e) => updateFileStructureTest(index, 'path', e.target.value)}
                  className="border-gray-300 rounded text-sm"
                  placeholder="Path (e.g., src/index.js)"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={test.description}
                  onChange={(e) => updateFileStructureTest(index, 'description', e.target.value)}
                  className="flex-1 border-gray-300 rounded text-sm"
                  placeholder="Description"
                />
                <button
                  type="button"
                  onClick={() => removeFileStructureTest(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addFileStructureTest}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add File Structure Test
          </button>
        </div>
      )}
    </div>
  );
}