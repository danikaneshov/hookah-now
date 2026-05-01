import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAppStore } from './store';
import { motion } from 'framer-motion';

function Checkout() {
  const navigate = useNavigate();
  const { currentOrder, user } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');

  if (!currentOrder) {
    navigate('/');
    return null;
  }

  const handlePlaceOrder = async () => {
    // Проверка наличия номера телефона перед заказом
    if (!user?.phone) {
      alert('Пожалуйста, привяжите номер телефона в Личном кабинете для связи с курьером.');
      return navigate('/profile');
    }

    if (!address.trim()) {
      return alert('Пожалуйста, укажите адрес доставки');
    }

    setIsLoading(true);

    try {
      const orderData = {
        userId: user?.uid || 'unknown',
        userName: user?.name || 'Без имени',
        userPhone: user.phone, // Передаем номер курьеру
        address: address,
        items: {
          mood: currentOrder.mood.id,
          title: currentOrder.mood.title,
          strength: currentOrder.strength,
          guests: currentOrder.guests,
          hasIce: currentOrder.hasIce,
        },
        totalAmount: currentOrder.totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log("Заказ создан с ID: ", docRef.id);
      
      // Перенаправляем на экран трекинга по ID заказа
      navigate(`/tracking/${docRef.id}`);

    } catch (error) {
      console.error("Ошибка при создании заказа: ", error);
      alert('Не удалось оформить заказ. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-xl font-bold">Оформление заказа</h1>
      </header>
      
      <div className="mb-8">
        <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <MapPin className="w-4 h-4"/> Куда везем?
        </label>
        <textarea 
          placeholder="Улица, дом, подъезд, этаж, квартира..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-surface border border-gray-800 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none h-24"
        />
      </div>

      <div className="bg-surface rounded-2xl p-5 mb-8 border border-gray-800">
        <h2 className="font-semibold mb-4">Ваш заказ</h2>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">{currentOrder.mood.title}</span>
          <span>{currentOrder.mood.basePrice} ₸</span>
        </div>
        {currentOrder.hasIce && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-gray-400">+ Лёд в колбу</span>
            <span className="text-gray-400">500 ₸</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm text-gray-400 mt-4 pt-4 border-t border-gray-800">
          <span>Крепость: {currentOrder.strength}/10</span>
          <span>Персон: {currentOrder.guests}</span>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3 mb-3">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0"/>
          <div>
            <h3 className="font-bold text-red-500">Строго 21+</h3>
            <p className="text-sm text-red-200/70 mt-1 leading-tight">
              Курьер передаст заказ только после проверки оригинала документа. В случае отказа заказ аннулируется.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-red-500/20 text-sm text-red-200">
          <CheckCircle2 className="w-4 h-4 text-red-400"/>
          Оплата курьеру после проверки (Карта / Наличные)
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6">
        <button 
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className={`w-full text-white font-bold py-4 rounded-2xl flex justify-between items-center px-6 transition-all shadow-[0_10px_20px_rgba(255,87,34,0.3)]
            ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-accent active:scale-95'}`}
        >
          <span>{isLoading ? 'Оформляем...' : 'Заказать кальян'}</span>
          {!isLoading && <span className="bg-white/20 px-3 py-1 rounded-lg">{currentOrder.totalPrice} ₸</span>}
        </button>
      </div>
    </motion.div>
  );
}

export default Checkout;