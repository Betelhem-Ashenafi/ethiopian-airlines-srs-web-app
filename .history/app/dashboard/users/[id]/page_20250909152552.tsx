"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchUsers, updateUser } from '@/lib/auth';
import { fetchDepartmentsDropdown } from '@/lib/dropdowns';

interface EditableUser {
  id: string;
  employeeID: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  departmentId?: number;
}

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const [user, setUser] = useState<EditableUser | null>(null);
  const [deptOptions, setDeptOptions] = useState<{id:string,name:string}[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [uRes, depts] = await Promise.all([
          fetchUsers(),
          fetchDepartmentsDropdown(),
        ]);
        setDeptOptions(depts || []);
        if (uRes.success) {
          const found = (uRes.users || []).find((u:any) => (u.id||u.userId||u.EmployeeID) === userId);
          if (found) {
            setUser({
              id: found.id || found.userId,
              employeeID: found.employeeID || found.EmployeeID || found.id,
              fullName: found.fullName || found.FullName || '',
              email: found.email || found.Email || '',
              role: found.role || found.Role || 'Employee',
              status: found.status || found.Status || 'Active',
              department: found.departmentName || found.DepartmentName || found.department,
            });
          } else {
            setError('User not found');
          }
        } else {
          setError(uRes.error || 'Failed to load users');
        }
      } catch (e:any) {
        setError(e.message);
      }
    })();
  }, [userId]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const res = await updateUser(user.id, {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.status === 'Active'
      });
      if (!res.success) {
        setError(res.error || 'Update failed');
      } else {
        router.push('/dashboard');
      }
    } catch (e:any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }
  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <Input value={user.employeeID} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <Input value={user.fullName} onChange={e=>setUser({...user, fullName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" value={user.email} onChange={e=>setUser({...user, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <Select value={user.role} onValueChange={val=>setUser({...user, role: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="Department Admin">Department Admin</SelectItem>
              <SelectItem value="System Admin">System Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select value={user.status === 'Active' ? 'Active' : 'Inactive'} onValueChange={val=>setUser({...user, status: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {user.role === 'Department Admin' && (
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Select value={String(user.departmentId || '')} onValueChange={val=>setUser({...user, departmentId: Number(val)})}>
              <SelectTrigger>
                <SelectValue placeholder={user.department || 'Select department'} />
              </SelectTrigger>
              <SelectContent>
                {deptOptions.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={()=>router.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
