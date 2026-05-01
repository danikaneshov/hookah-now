import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { useAppStore } from './store';
import { ArrowLeft, Phone, History, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Загружаем телефон из базы и историю заказов при открытии экрана
  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserData = async () => {
      try {
        // 1. Достаем телефон пользователя
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists() && userSnap.data().phone) {
          const fetchedPhone = userSnap.data().phone;
          setPhone(fetchedPhone);
          setUser({ ...user, phone: fetchedPhone }); // Обновляем в глобальном хранилище
        }

        // 2. Достаем историю заказов именно этого пользователя
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid)
        );
        const ordersSnap = await getDocs(q);
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Сортируем локально (чтобы не создавать сложные индексы в Firebase)
        ordersData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setOrders(ordersData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleSavePhone = async () => {
    if (phone.length < 10) return alert('Введите корректный номер телефона');
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { phone }, { merge: true });
      setUser({ ...user, phone }); // Обновляем состояние
      alert('Номер успешно сохранен!');
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert('Не удалось сохранить номер.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-dark text-white p-6 pb-24"
    >
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface rounded-full text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <h1 className="text-xl font-bold">Личный кабинет</h1>
      </header>

      {/* Карточка пользователя */}
      <div className="flex flex-col items-center mb-8">
        <img src={user?.photo} alt="avatar" className="w-24 h-24 rounded-full mb-4 border-4 border-surface shadow-lg" />
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-gray-400 text-sm">{user?.email}</p>
      </div>

      {/* Привязка телефона */}
      <div className="bg-surface rounded-3xl p-5 mb-8 border border-gray-800">
        <h3 className="flex items-center gap-2 font-semibold mb-4">
          <Phone className="w-5 h-5 text-accent"/> Телефон для курьера
        </h3>
        {!user?.phone && (
          <div className="flex items-start gap-2 mb-4 text-xs text-orange-400 bg-orange-400/10 p-3 rounded-xl border border-orange-400/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>Добавьте номер, чтобы курьер мог связаться с вами при доставке заказа.</p>
          </div>
        )}
        <div className="flex gap-2">
          <input 
            type="tel" 
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-dark border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button 
          onClick={handleSavePhone}
          disabled={isSaving || phone === user?.phone}
          className={`w-full mt-3 font-bold py-4 rounded-xl transition-all
            ${phone === user?.phone ? 'bg-dark text-green-400 border border-green-500/30' : 'bg-accent text-white active:scale-95'}`}
        >
          {phone === user?.phone ? 'Номер сохранен' : (isSaving ? 'Сохранение...' : 'Сохранить номер')}
        </button>
      </div>

      {/* История заказов */}
      <div className="mb-8">
        <h3 className="flex items-center gap-2 font-semibold mb-4 text-gray-300">
          <History className="w-5 h-5"/> История заказов
        </h3>
        
        {isLoadingOrders ? (
          <p className="text-gray-500 text-center py-4">Загрузка...</p>
        ) : orders.length === 0 ? (
          <div className="bg-surface rounded-3xl p-6 text-center border border-gray-800">
            <p className="text-gray-500 text-sm">У вас пока нет заказов.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} onClick={() => navigate(`/tracking/${order.id}`)} className="bg-surface rounded-2xl p-4 border border-gray-800 active:scale-95 transition-transform cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{order.items.title}</span>
                  <span className="text-accent font-bold">{order.totalAmount} ₸</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{new Date(order.createdAt?.toDate()).toLocaleDateString('ru-RU')}</span>
                  <span className="flex items-center gap-1">
                    {order.status === 'delivered' ? <CheckCircle2 className="w-3 h-3 text-green-400"/> : <Clock className="w-3 h-3"/>}
                    {order.status === 'delivered' ? 'Доставлен' : 'В процессе'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Кнопка выхода */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-500/20"
      >
        <LogOut className="w-5 h-5"/> Выйти из аккаунта
      </button>

    </motion.div>
  );
}

export default Profile;