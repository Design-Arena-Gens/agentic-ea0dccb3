'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Calendar, DollarSign, Trash2, Check, X } from 'lucide-react'

interface Worker {
  id: string
  name: string
  role: string
  dailyRate: number
  attendance: AttendanceRecord[]
}

interface AttendanceRecord {
  date: string
  status: 'present' | 'absent'
  hours?: number
}

export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWorker, setNewWorker] = useState({ name: '', role: 'Plumber', dailyRate: 0 })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const saved = localStorage.getItem('contractorData')
    if (saved) {
      setWorkers(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (workers.length > 0) {
      localStorage.setItem('contractorData', JSON.stringify(workers))
    }
  }, [workers])

  const addWorker = () => {
    if (!newWorker.name || newWorker.dailyRate <= 0) return

    const worker: Worker = {
      id: Date.now().toString(),
      name: newWorker.name,
      role: newWorker.role,
      dailyRate: newWorker.dailyRate,
      attendance: []
    }

    setWorkers([...workers, worker])
    setNewWorker({ name: '', role: 'Plumber', dailyRate: 0 })
    setShowAddForm(false)
  }

  const markAttendance = (workerId: string, status: 'present' | 'absent') => {
    setWorkers(workers.map(worker => {
      if (worker.id === workerId) {
        const existingIndex = worker.attendance.findIndex(a => a.date === selectedDate)
        const newAttendance = [...worker.attendance]

        if (existingIndex >= 0) {
          newAttendance[existingIndex] = { date: selectedDate, status, hours: status === 'present' ? 8 : 0 }
        } else {
          newAttendance.push({ date: selectedDate, status, hours: status === 'present' ? 8 : 0 })
        }

        return { ...worker, attendance: newAttendance }
      }
      return worker
    }))
  }

  const getAttendanceForDate = (worker: Worker, date: string) => {
    return worker.attendance.find(a => a.date === date)
  }

  const calculateTotalAmount = (worker: Worker) => {
    const presentDays = worker.attendance.filter(a => a.status === 'present').length
    return presentDays * worker.dailyRate
  }

  const getTotalStats = (worker: Worker) => {
    const present = worker.attendance.filter(a => a.status === 'present').length
    const absent = worker.attendance.filter(a => a.status === 'absent').length
    return { present, absent, total: present + absent }
  }

  const deleteWorker = (id: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      setWorkers(workers.filter(w => w.id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Contractor Management
              </h1>
              <p className="text-gray-600">Track attendance and payments for your team</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <UserPlus size={20} />
              Add Worker
            </button>
          </div>

          {showAddForm && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Worker</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Worker Name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newWorker.role}
                  onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Plumber</option>
                  <option>Assistant Plumber</option>
                  <option>Helper</option>
                  <option>Supervisor</option>
                </select>
                <input
                  type="number"
                  placeholder="Daily Rate ($)"
                  value={newWorker.dailyRate || ''}
                  onChange={(e) => setNewWorker({ ...newWorker, dailyRate: parseFloat(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={addWorker}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Save Worker
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-600 font-medium">Mark Attendance</span>
          </div>

          {workers.length === 0 ? (
            <div className="text-center py-16">
              <UserPlus className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-xl text-gray-500">No workers added yet</p>
              <p className="text-gray-400 mt-2">Click "Add Worker" to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Daily Rate</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Attendance Today</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Present</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Absent</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Total Amount</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => {
                    const todayAttendance = getAttendanceForDate(worker, selectedDate)
                    const stats = getTotalStats(worker)
                    const totalAmount = calculateTotalAmount(worker)

                    return (
                      <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{worker.name}</td>
                        <td className="p-4 text-gray-600">{worker.role}</td>
                        <td className="p-4 text-gray-800">${worker.dailyRate}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => markAttendance(worker.id, 'present')}
                              className={`p-2 rounded-lg transition-colors ${
                                todayAttendance?.status === 'present'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 hover:bg-green-100 text-gray-600'
                              }`}
                              title="Mark Present"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => markAttendance(worker.id, 'absent')}
                              className={`p-2 rounded-lg transition-colors ${
                                todayAttendance?.status === 'absent'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 hover:bg-red-100 text-gray-600'
                              }`}
                              title="Mark Absent"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                            {stats.present}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                            {stats.absent}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-green-600 font-bold text-lg">
                            <DollarSign size={20} />
                            {totalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => deleteWorker(worker.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete Worker"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {workers.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Workers</p>
                  <p className="text-3xl font-bold">{workers.length}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Present Today</p>
                  <p className="text-3xl font-bold">
                    {workers.filter(w => getAttendanceForDate(w, selectedDate)?.status === 'present').length}
                  </p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Amount Owed</p>
                  <p className="text-3xl font-bold">
                    ${workers.reduce((sum, w) => sum + calculateTotalAmount(w), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
