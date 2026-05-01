import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { ArrowLeft, Clock, Flame, Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function Tracking() {
  const { id } = useParams(); // Получаем ID заказа из ссылки
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Подключаем слушатель реального времени к конкретному заказу
    const docRef = doc(db, 'orders', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder(docSnap.data());
      }
    });

    // Отписываемся при закрытии страницы
    return () => unsubscribe();
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Загрузка данных заказа...</p>
      </div>
    );
  }

  // Логика визуализации статусов
  const statusConfig = {
    pending: { text: 'Заказ принят, ждем подтверждения', icon: Clock, color: 'text-gray-400', step: 1 },
    accepted: { text: 'Кальян готовится (греем угли)', icon: Flame, color: 'text-orange-400', step: 2 },
    delivering: { text: 'Курьер в пути', icon: Truck, color: 'text-cyan-400', step: 3 },
    delivered: { text: 'Доставлен. Приятного отдыха!', icon: CheckCircle2, color: 'text-green-400', step: 4 },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-dark text-white p-6 pb-24"
    >
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-surface rounded-full text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Статус заказа</h1>
      </header>

      <div className="bg-surface border border-gray-800 rounded-3xl p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className={`p-6 rounded-full bg-dark border-4 border-surface shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
          >
            <currentStatus.icon className={`w-12 h-12 ${currentStatus.color}`} />
          </motion.div>
        </div>
        <h2 className="text-center text-2xl font-bold mb-2">{currentStatus.text}</h2>
        <p className="text-center text-gray-400 text-sm mb-6">ID: {id.slice(0, 8).toUpperCase()}</p>

        {/* Шкала прогресса */}
        <div className="relative pt-4">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-accent -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStatus.step - 1) / 3) * 100}%` }}
          ></div>
          
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={`w-4 h-4 rounded-full transition-colors duration-500 ${
                  currentStatus.step >= step ? 'bg-accent shadow-[0_0_10px_rgba(255,87,34,0.5)]' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 border border-gray-800">
        <h3 className="font-semibold mb-4">Детали</h3>
        <p className="text-sm text-gray-400 mb-2">Вкус: <span className="text-white">{order.items.title}</span></p>
        <p className="text-sm text-gray-400 mb-2">Крепость: <span className="text-white">{order.items.strength}/10</span></p>
        <p className="text-sm text-gray-400 mb-2">Лёд: <span className="text-white">{order.items.hasIce ? 'Да' : 'Нет'}</span></p>
        <p className="text-sm text-gray-400 mt-4 pt-4 border-t border-gray-800">Итого к оплате: <span className="text-white font-bold">{order.totalAmount} ₸</span></p>
      </div>
    </motion.div>
  );
}

export default Tracking;