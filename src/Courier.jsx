import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { MapPin, Phone, ShieldAlert, Check, ChevronRight, Clock } from 'lucide-react';

function Courier() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Слушаем коллекцию 'orders', сортируем по времени создания (новые сверху)
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  // Функция для смены статуса заказа
  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      alert("Не удалось обновить статус");
    }
  };

  // Фильтруем только активные заказы (не доставленные и не отмененные)
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-accent">Панель курьера</h1>
        <p className="text-sm text-gray-400">Активных заказов: {activeOrders.length}</p>
      </header>

      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Clock className="w-12 h-12 mb-4 opacity-20" />
          <p>Нет активных заказов</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-surface border border-gray-800 rounded-2xl p-5">
              
              {/* Шапка карточки заказа */}
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-800">
                <div>
                  <span className="text-xs font-bold text-gray-400 bg-dark px-2 py-1 rounded-md uppercase">
                    {order.status === 'pending' && 'Новый'}
                    {order.status === 'accepted' && 'Готовится'}
                    {order.status === 'delivering' && 'В пути'}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">ID: {order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-accent">{order.totalAmount} ₸</p>
                  <p className="text-xs text-gray-400">Оплата при получении</p>
                </div>
              </div>

              {/* Детали клиента и заказа */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="text-sm font-medium leading-tight">{order.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="text-sm font-medium">{order.userName}</p>
                </div>
                <div className="bg-dark p-3 rounded-xl text-sm text-gray-300 mt-2 border border-gray-800">
                  <span className="font-bold text-white">{order.items.title}</span> • Крепость: {order.items.strength}/10 
                  {order.items.hasIce && ' • + Лёд'} • Персон: {order.items.guests}
                </div>
              </div>

              {/* Кнопки управления статусом */}
              {order.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(order.id, 'accepted')}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Принять в работу (Греть угли)
                </button>
              )}

              {order.status === 'accepted' && (
                <button 
                  onClick={() => updateStatus(order.id, 'delivering')}
                  className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                  Курьер выехал
                </button>
              )}

              {order.status === 'delivering' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-sm">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <p>Проверьте оригинал документа! Передача только лицам старше 21 года.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if(window.confirm('Паспорт проверен? Клиенту есть 21 год?')) {
                        updateStatus(order.id, 'delivered');
                      }
                    }}
                    className="w-full bg-green-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Check className="w-5 h-5" />
                    Паспорт проверен, Заказ выдан
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courier;