import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Wind, Sparkles, Citrus, Skull, X, Snowflake, Users, Activity } from 'lucide-react';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useAppStore } from './store';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
  { id: 'sweet', title: 'Лёгкий и сладкий', desc: 'Ягоды, десерты, без удара по горлу', basePrice: 6500, icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
  { id: 'fresh', title: 'Свежий и мятный', desc: 'Цитрус, хвоя, приятный холодок', basePrice: 6500, icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
  { id: 'fruit', title: 'Фруктовый микс', desc: 'Сочные тропики, кисло-сладкий баланс', basePrice: 7000, icon: Citrus, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  { id: 'strong', title: 'Крепкий и строгий', desc: 'Тёмный лист, пряности, уверенная крепость', basePrice: 8000, icon: Skull, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
];

function Home() {
  const navigate = useNavigate();
  const { user, setUser, logout, setOrder } = useAppStore();
  
  // Состояния выбора
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Состояния конфигуратора
  const [strength, setStrength] = useState(5);
  const [hasIce, setHasIce] = useState(false);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
      // Ловим результат возвращения со страницы Google
      getRedirectResult(auth).catch((error) => {
        console.error("Ошибка после возвращения от Google:", error);
        alert("Не удалось войти. Попробуйте еще раз.");
      });

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser((prev) => ({
            ...prev,
            uid: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            photo: currentUser.photoURL,
          }));
        } else {
          logout();
        }
      });
      return () => unsubscribe();
    }, [setUser, logout]);

  const handleLogin = async () => {
      try {
        // Меняем метод на Redirect (работает железобетонно в PWA)
        await signInWithRedirect(auth, googleProvider);
      } catch (error) {
        console.error("Ошибка при входе:", error);
      }
    };

  const selectedMood = MOODS.find(m => m.id === selectedMoodId);
  const totalPrice = selectedMood ? selectedMood.basePrice + (hasIce ? 500 : 0) : 0;

  // Экран неавторизованного пользователя
  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,87,34,0.3)]">
            <Flame className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Hookah Now</h1>
          <p className="text-gray-400 mt-2 text-center text-sm">Доставка кальяна за 45 минут.<br/>Без лишних слов.</p>
        </div>
        <button onClick={handleLogin} className="w-full max-w-sm bg-white text-black font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 active:scale-95 transition-all">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Войти через Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white p-6 pb-24 relative overflow-hidden">
      {/* Шапка с переходом в профиль */}
      <header className="flex justify-between items-center mb-8">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 cursor-pointer bg-surface py-2 pl-2 pr-4 rounded-full border border-gray-800 active:scale-95 transition-transform shadow-md"
        >
          <img src={user.photo} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-[10px] text-gray-400 leading-tight uppercase tracking-wider">Профиль</p>
            <p className="font-semibold text-sm leading-tight truncate max-w-[120px]">{user.name}</p>
          </div>
        </div>
      </header>

      <h1 className="text-2xl font-bold mb-6">Какое настроение сегодня?</h1>

      {/* Сетка настроений */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOODS.map((mood, index) => {
          const Icon = mood.icon;
          const isSelected = selectedMoodId === mood.id;

          return (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedMoodId(mood.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 
                ${isSelected ? `border-accent bg-surface scale-[1.02] shadow-[0_0_20px_rgba(255,87,34,0.15)]` : `border-transparent bg-surface/50 hover:bg-surface`}`}
            >
              <div className={`p-3 rounded-xl ${mood.bg} ${mood.border} border`}>
                <Icon className={`w-6 h-6 ${mood.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{mood.title}</h3>
                <p className="text-sm text-gray-400 leading-tight mb-3">{mood.desc}</p>
                <span className="font-medium">{mood.basePrice} ₸</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Кнопка "Настроить и заказать" */}
      <AnimatePresence>
        {selectedMoodId && !isSheetOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 z-10"
          >
            <button 
              onClick={() => setIsSheetOpen(true)}
              className="w-full bg-accent text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(255,87,34,0.3)] active:scale-95 transition-transform"
            >
              Настроить и заказать
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet (Шторка конфигуратора) */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-surface z-30 rounded-t-3xl p-6 pb-10 border-t border-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedMood?.title}</h2>
                  <p className="text-sm text-gray-400">Точная настройка</p>
                </div>
                <button onClick={() => setIsSheetOpen(false)} className="p-2 bg-dark rounded-full text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm text-gray-300"><Activity className="w-4 h-4 text-accent"/> Крепость</span>
                  <span className="text-sm font-bold">{strength}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={strength}
                  onChange={(e) => setStrength(parseInt(e.target.value))}
                  className="w-full accent-accent h-2 bg-dark rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center mb-6 bg-dark p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-400/10 rounded-lg"><Snowflake className="w-5 h-5 text-cyan-400" /></div>
                  <div>
                    <p className="font-medium">Лёд в колбу</p>
                    <p className="text-xs text-gray-400">+ 500 ₸</p>
                  </div>
                </div>
                <div 
                  onClick={() => setHasIce(!hasIce)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${hasIce ? 'bg-accent' : 'bg-gray-700'}`}
                >
                  <motion.div 
                    layout 
                    className="bg-white w-4 h-4 rounded-full shadow-md"
                    animate={{ x: hasIce ? 24 : 0 }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 bg-dark p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-400/10 rounded-lg"><Users className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <p className="font-medium">Количество персон</p>
                    <p className="text-xs text-gray-400">Мундштуки в комплекте</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface rounded-lg p-1">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center rounded-md bg-dark text-gray-300 hover:text-white">-</button>
                  <span className="w-4 text-center font-bold">{guests}</span>
                  <button onClick={() => setGuests(guests + 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-dark text-gray-300 hover:text-white">+</button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setOrder({ mood: selectedMood, strength, hasIce, guests, totalPrice });
                  setIsSheetOpen(false);
                  navigate('/checkout');
                }}
                className="w-full bg-accent text-white font-bold py-4 rounded-2xl flex justify-between items-center px-6 active:scale-95 transition-transform shadow-[0_10px_20px_rgba(255,87,34,0.2)]"
              >
                <span>Указать адрес</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg">{totalPrice} ₸</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;