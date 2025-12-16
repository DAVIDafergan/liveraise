import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/admin');
      } else {
        alert('נרשמת בהצלחה! כעת התחבר');
        setIsLogin(true);
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4" dir="rtl">
      <form onSubmit={handleAuth} className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/10">
        <h1 className="text-3xl font-black mb-6 text-center text-indigo-400">LiveRaise</h1>
        <h2 className="text-xl mb-6 text-center">{isLogin ? 'כניסה למערכת' : 'הרשמה למשתמש חדש'}</h2>
        
        <input 
          className="w-full bg-slate-700 p-3 rounded-lg mb-4 border border-white/5" 
          placeholder="שם משתמש" 
          value={username} onChange={e => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          className="w-full bg-slate-700 p-3 rounded-lg mb-6 border border-white/5" 
          placeholder="סיסימה" 
          value={password} onChange={e => setPassword(e.target.value)} 
        />
        
        <button className="w-full bg-indigo-600 p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
          {isLogin ? 'התחבר' : 'צור חשבון'}
        </button>
        
        <p className="mt-4 text-center text-sm opacity-60 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'אין לך חשבון? הירשם כאן' : 'כבר רשום? התחבר כאן'}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;