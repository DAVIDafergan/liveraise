import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './views/LoginPage'; // וודא שהקובץ קיים בנתיב הזה
import AdminDashboard from './views/AdminDashboard';
import LiveScreen from './views/LiveScreen';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* דף הבית החדש הוא דף הכניסה/הרשמה */}
        <Route path="/" element={<LoginPage />} />
        
        {/* דף הניהול - המערכת תזהה את המשתמש לפי ה-Session/LocalStorage */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* מסך הלייב - מקבל כעת 'slug' (שם משתמש) במקום ID גנרי */}
        <Route path="/screen/:slug" element={<LiveScreen />} />
        
        {/* כל נתיב אחר יחזיר לדף הכניסה */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;