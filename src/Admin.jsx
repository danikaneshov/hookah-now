import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Admin() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, clients
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем заказы
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnap = await getDocs(qOrders);
        const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);

        // Загружаем клиентов
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error("Ошибка при загрузке данных админки:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Считаем выручку (только со статусом delivered)
  const totalRevenue = orders.reduce((sum, order) => {
    return order.status === 'delivered' ? sum + (order.totalAmount || 0) : sum;
  }, 0);

  if (isLoading) {
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Загрузка данных...</div>;
  }

  return (
    <div className="min-h-screen bg-dark text-white p-6 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-surface rounded-full text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-accent">Панель Владельца</h1>
      </header>

      {/* Навигация (Табы) */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'bg-accent text-white' : 'bg-surface text-gray-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Сводка
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'orders' ? 'bg-accent text-white' : 'bg-surface text-gray-400'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Все заказы
        </button>
        <button 
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${activeTab === 'clients' ? 'bg-accent text-white' : 'bg-surface text-gray-400'}`}
        >
          <Users className="w-4 h-4" /> База клиентов
        </button>
      </div>

      {/* Контент табов */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* ТАБ: СВОДКА */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2 text-gray-400">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h3 className="font-medium">Общая выручка</h3>
              </div>
              <p className="text-3xl font-bold text-white">{totalRevenue.toLocaleString('ru-RU')} ₸</p>
              <p className="text-xs text-gray-500 mt-2">Считаются только выданные заказы</p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2 text-gray-400">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h3 className="font-medium">Всего заказов</h3>
              </div>
              <p className="text-3xl font-bold text-white">{orders.length}</p>
            </div>
          </div>
        )}

        {/* ТАБ: ВСЕ ЗАКАЗЫ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? <p className="text-gray-500 text-center py-10">Заказов пока нет</p> : null}
            {orders.map(order => (
              <div key={order.id} className="bg-surface p-4 rounded-2xl border border-gray-800 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{order.items?.title || 'Кальян'}</p>
                    <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString('ru-RU') : 'Нет даты'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">{order.totalAmount} ₸</p>
                    <span className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold
                      ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-2 pt-2 border-t border-gray-800">
                  <p>Клиент: {order.userName} ({order.userPhone || 'Нет номера'})</p>
                  <p className="truncate">Адрес: {order.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ТАБ: БАЗА КЛИЕНТОВ */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {users.length === 0 ? <p className="text-gray-500 text-center py-10">Клиентов пока нет</p> : null}
            {users.map(u => (
              <div key={u.id} className="bg-surface p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                <div>
                  <p className="font-bold">{u.phone || 'Номер не указан'}</p>
                  <p className="text-xs text-gray-500">ID: {u.id.slice(0, 8)}</p>
                </div>
                {u.phone ? (
                  <a href={`tel:${u.phone.replace(/[^0-9+]/g, '')}`} className="p-2 bg-dark rounded-full text-green-400 border border-green-500/30">
                    <Phone className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-xs text-orange-400">Нет номера</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Admin;