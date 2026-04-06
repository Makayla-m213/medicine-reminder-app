'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface Prescription {
  _id: string;
  title: string;
  dosage: string;
  time: string;
  status: string;
  dateLogged: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<Id<"students"> | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditChildForm, setShowEditChildForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    dosage: '',
    time: '',
  });
  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    grade: '',
    parentName: '',
    parentContact: '',
    medicalNotes: '',
  });
  const [editChildData, setEditChildData] = useState({
    name: '',
    age: '',
    grade: '',
    parentName: '',
    parentContact: '',
    medicalNotes: '',
  });

  // Get parent's children from Convex
  const children = useQuery(api.parents.getParentChildren, 
    user ? { parentId: user.id as Id<"parents"> } : "skip"
  );
  
  // Get prescriptions for selected child
  const prescriptions = useQuery(api.prescriptions.getPrescriptionsByStudent,
    selectedChildId ? { studentId: selectedChildId } : "skip"
  );
  
  // Get teacher notes for selected child
  const teacherNotes = useQuery(api.notes.getNotesByStudent,
    selectedChildId ? { studentId: selectedChildId } : "skip"
  );
  
  const addPrescription = useMutation(api.prescriptions.addPrescription);
  const updatePrescription = useMutation(api.prescriptions.updatePrescriptionStatus);
  const deletePrescription = useMutation(api.prescriptions.deletePrescription);
  const editPrescription = useMutation(api.prescriptions.editPrescription);
  const addStudent = useMutation(api.students.addStudent);
  const linkParentToChild = useMutation(api.parents.linkParentToChild);
  const editStudent = useMutation(api.students.editStudent);
  const deleteStudent = useMutation(api.students.deleteStudent);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      router.push('/parent/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'parent') {
      router.push('/parent/login');
      return;
    }
    setUser(parsedUser);
  }, [router]);

  // Auto-select first child when children load
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0]._id);
    }
  }, [children, selectedChildId]);

  if (!user) return null;
  
  if (children === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedChild = children?.find(c => c._id === selectedChildId);
  
  // Calculate compliance
  const completedCount = prescriptions?.filter(p => p.status === 'completed').length || 0;
  const totalCount = prescriptions?.length || 0;
  const compliance = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) return;
    
    await addPrescription({
      studentId: selectedChildId,
      title: formData.title,
      dosage: formData.dosage,
      time: formData.time,
      status: "pending",
      dateLogged: new Date().toISOString(),
    });
    
    setFormData({ title: '', dosage: '', time: '' });
    setShowPrescriptionForm(false);
    alert('✅ Prescription added! It will sync to the wearable device.');
  };

  const handleEditClick = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      title: prescription.title,
      dosage: prescription.dosage,
      time: prescription.time,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrescription) return;
    
    await editPrescription({
      prescriptionId: editingPrescription._id as any,
      title: formData.title,
      dosage: formData.dosage,
      time: formData.time,
    });
    
    setShowEditModal(false);
    setEditingPrescription(null);
    setFormData({ title: '', dosage: '', time: '' });
    alert('✅ Prescription updated successfully!');
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentId = await addStudent({
      name: newChild.name,
      age: parseInt(newChild.age),
      grade: newChild.grade,
      parentName: newChild.parentName,
      parentContact: newChild.parentContact,
      medicalNotes: newChild.medicalNotes,
    });
    
    await linkParentToChild({
      parentId: user.id as Id<"parents">,
      studentId: studentId,
      relationship: "parent",
    });
    
    setNewChild({
      name: '',
      age: '',
      grade: '',
      parentName: '',
      parentContact: '',
      medicalNotes: '',
    });
    setShowAddChildForm(false);
    alert('✅ Child added successfully!');
  };

  // Edit Child Handler
  const handleEditChildClick = (child: any) => {
    setEditingChild(child);
    setEditChildData({
      name: child.name,
      age: child.age.toString(),
      grade: child.grade,
      parentName: child.parentName,
      parentContact: child.parentContact,
      medicalNotes: child.medicalNotes || '',
    });
    setShowEditChildForm(true);
  };

  // Save Edit Child Handler
  const handleSaveChildEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;
    
    await editStudent({
      studentId: editingChild._id,
      name: editChildData.name,
      age: parseInt(editChildData.age),
      grade: editChildData.grade,
      parentName: editChildData.parentName,
      parentContact: editChildData.parentContact,
      medicalNotes: editChildData.medicalNotes,
    });
    
    setShowEditChildForm(false);
    setEditingChild(null);
    alert('✅ Child information updated successfully!');
  };

  // Delete Child Handler
  const handleDeleteChild = async (childId: string, childName: string) => {
    if (confirm(`Are you sure you want to delete ${childName}? This will also delete ALL prescriptions and notes. This cannot be undone!`)) {
      await deleteStudent({ studentId: childId as any });
      alert(`✅ ${childName} has been deleted.`);
      if (selectedChildId === childId) {
        setSelectedChildId(null);
      }
    }
  };

  const handleUpdateStatus = async (prescriptionId: string, newStatus: string) => {
    await updatePrescription({
      prescriptionId: prescriptionId as any,
      status: newStatus as any
    });
    alert(`✅ Prescription marked as ${newStatus}`);
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (confirm('Are you sure you want to delete this prescription?')) {
      await deletePrescription({ prescriptionId: prescriptionId as any });
      alert('❌ Prescription deleted');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/parent/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medicine Reminder</h1>
                <p className="text-sm text-gray-600">Parent Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show Add Child Button if no children */}
        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center mb-6">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Children Added Yet</h2>
            <p className="text-gray-600 mb-6">Click the button below to add your first child</p>
            <button
              onClick={() => setShowAddChildForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
            >
              + Add Your First Child
            </button>
          </div>
        ) : (
          <>
            {/* Child Selector with Edit/Delete Buttons */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Child:</label>
                  <div className="flex gap-3 flex-wrap">
                    {children.map((child) => (
                      <div key={child._id} className="flex items-center gap-1 bg-gray-100 rounded-lg">
                        <button
                          onClick={() => setSelectedChildId(child._id)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            selectedChildId === child._id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {child.name}
                        </button>
                        <button
                          onClick={() => handleEditChildClick(child)}
                          className="text-blue-500 hover:text-blue-700 px-2 text-sm"
                          title="Edit child"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child._id, child.name)}
                          className="text-red-500 hover:text-red-700 px-2 text-sm"
                          title="Delete child"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowAddChildForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                >
                  + Add Another Child
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Compliance Rate</p>
                <p className="text-3xl font-bold text-green-600">{compliance}%</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Active Prescriptions</p>
                <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Pending/Missed</p>
                <p className="text-3xl font-bold text-yellow-600">{totalCount - completedCount}</p>
              </div>
            </div>

            {/* Child Info + Add Prescription Button */}
            {selectedChild && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">👶 Child Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-900">{selectedChild.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grade / Age</p>
                        <p className="font-semibold text-gray-900">{selectedChild.grade} • Age {selectedChild.age}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Parent Contact</p>
                        <p className="font-semibold text-gray-900">{selectedChild.parentContact}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Medical Notes</p>
                        <p className="font-semibold text-gray-900">{selectedChild.medicalNotes}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPrescriptionForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
                  >
                    + Add Prescription
                  </button>
                </div>
              </div>
            )}

            {/* Teacher Notes Section */}
            {selectedChild && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Notes from Teachers</h2>
                {!teacherNotes || teacherNotes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No teacher notes yet</p>
                ) : (
                  <div className="space-y-3">
                    {teacherNotes.map((note) => (
                      <div key={note._id} className={`p-3 rounded-lg ${note.concern ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                        <p className="text-gray-800">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.timestamp).toLocaleString()}
                          {note.concern && <span className="ml-2 text-red-600 font-semibold">⚠️ Concern</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active Prescriptions List with EDIT button */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Active Prescriptions</h2>
              {!prescriptions || prescriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No prescriptions yet. Click "Add Prescription" to create one.</p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{prescription.title}</h3>
                          <p className="text-sm text-gray-600">{prescription.dosage}</p>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={prescription.status}
                            onChange={(e) => handleUpdateStatus(prescription._id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              prescription.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                              prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-red-100 text-red-800 border-red-300'
                            }`}
                          >
                            <option value="pending">⏰ Pending</option>
                            <option value="completed">✅ Completed</option>
                            <option value="missed">❌ Missed</option>
                          </select>
                          <button
                            onClick={() => handleEditClick(prescription)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeletePrescription(prescription._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>⏰ Scheduled:</strong> {prescription.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Added: {new Date(prescription.dateLogged).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add Child Modal */}
      {showAddChildForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Add New Child</h2>
            <form onSubmit={handleAddChild}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newChild.name}
                    onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={newChild.age}
                    onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <input
                    type="text"
                    required
                    value={newChild.grade}
                    onChange={(e) => setNewChild({...newChild, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., Grade 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={newChild.parentName}
                    onChange={(e) => setNewChild({...newChild, parentName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={newChild.parentContact}
                    onChange={(e) => setNewChild({...newChild, parentContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., +254712345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                  <textarea
                    value={newChild.medicalNotes}
                    onChange={(e) => setNewChild({...newChild, medicalNotes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="Any allergies or medical conditions..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddChildForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add Child
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditChildForm && editingChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">✏️ Edit {editingChild.name}</h2>
            <form onSubmit={handleSaveChildEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editChildData.name}
                    onChange={(e) => setEditChildData({...editChildData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    value={editChildData.age}
                    onChange={(e) => setEditChildData({...editChildData, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <input
                    type="text"
                    required
                    value={editChildData.grade}
                    onChange={(e) => setEditChildData({...editChildData, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={editChildData.parentName}
                    onChange={(e) => setEditChildData({...editChildData, parentName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={editChildData.parentContact}
                    onChange={(e) => setEditChildData({...editChildData, parentContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                  <textarea
                    value={editChildData.medicalNotes}
                    onChange={(e) => setEditChildData({...editChildData, medicalNotes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditChildForm(false);
                    setEditingChild(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Prescription Modal */}
      {showPrescriptionForm && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Add Prescription for {selectedChild.name}</h2>
            <form onSubmit={handleAddPrescription}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., Amoxicillin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder="e.g., 250mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Save to Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {showEditModal && editingPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">✏️ Edit Prescription</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPrescription(null);
                    setFormData({ title: '', dosage: '', time: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Banner */}
      {children.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            💡 <strong>How it works:</strong> Prescriptions you add are sent to your child's wearable device. 
            Teachers can see your child's information and add notes, but cannot modify prescriptions.
          </p>
        </div>
      )}
    </div>
  );
}