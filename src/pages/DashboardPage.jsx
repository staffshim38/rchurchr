import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function DashboardPage({ session, onLogout }) {
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMember() {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('members')
        .insert([{
          user_id: session.user.id,
          name: newMemberName,
          email: newMemberEmail
        }]);

      if (error) throw error;
      setNewMemberName('');
      setNewMemberEmail('');
      await fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAttendance(memberId, isPresent) {
    try {
      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('member_id', memberId)
        .eq('attendance_date', selectedDate)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('attendance_records')
          .update({ present: !isPresent })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance_records')
          .insert([{
            member_id: memberId,
            attendance_date: selectedDate,
            present: true
          }]);
        if (error) throw error;
      }
      await fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function getMemberAttendance(memberId) {
    try {
      const { data } = await supabase
        .from('attendance_records')
        .select('present')
        .eq('member_id', memberId)
        .eq('attendance_date', selectedDate)
        .maybeSingle();

      return data?.present || false;
    } catch {
      return false;
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #5B4CF8 0%, #7C5DFF 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700' }}>
            GraceLog
          </h1>
          <p style={{ margin: '0', fontSize: '13px', opacity: 0.9 }}>
            {session.user.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          로그아웃
        </button>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginTop: '0',
            marginBottom: '16px'
          }}>
            신입 회원 등록
          </h2>
          <div style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="이름"
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="이메일"
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={addMember}
              style={{
                padding: '10px 16px',
                background: '#5B4CF8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#6D5EFF'}
              onMouseOut={(e) => e.target.style.background = '#5B4CF8'}
            >
              등록
            </button>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
              margin: '0'
            }}>
              출석 현황
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontSize: '14px'
            }}>
              로딩 중...
            </div>
          ) : members.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
              fontSize: '14px'
            }}>
              등록된 회원이 없습니다. 위에서 신입 회원을 등록해주세요.
            </div>
          ) : (
            <MembersList
              members={members}
              selectedDate={selectedDate}
              onAttendanceToggle={toggleAttendance}
              getMemberAttendance={getMemberAttendance}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MembersList({ members, selectedDate, onAttendanceToggle, getMemberAttendance }) {
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    async function fetchAllAttendance() {
      const statuses = {};
      for (const member of members) {
        const present = await getMemberAttendance(member.id);
        statuses[member.id] = present;
      }
      setAttendanceStatus(statuses);
    }
    fetchAllAttendance();
  }, [selectedDate, members]);

  return (
    <div style={{ display: 'grid', gap: '8px' }}>
      {members.map((member) => (
        <div
          key={member.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#f9f9f9',
            border: '1px solid #eee',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}
        >
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1a1a1a'
            }}>
              {member.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999'
            }}>
              {member.email}
            </div>
          </div>
          <button
            onClick={() => onAttendanceToggle(member.id, attendanceStatus[member.id])}
            style={{
              padding: '8px 16px',
              background: attendanceStatus[member.id] ? '#10b981' : '#e5e7eb',
              color: attendanceStatus[member.id] ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = attendanceStatus[member.id] ? '#059669' : '#d1d5db';
            }}
            onMouseOut={(e) => {
              e.target.style.background = attendanceStatus[member.id] ? '#10b981' : '#e5e7eb';
            }}
          >
            {attendanceStatus[member.id] ? '출석' : '미출석'}
          </button>
        </div>
      ))}
    </div>
  );
}
