import React, { useState, useEffect } from 'react';
import { nutritionApi } from '../../api/services';
import { Meal, WaterSummary } from '../../types';
import { WaterTracker } from '../../components/nutrition/WaterTracker';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useAuthenticatedImage } from '../../utils/useAuthImage';
import {
  Apple,
  Camera,
  Plus,
  Trash2,
  Lightbulb,
  Utensils,
  Clock,
  Sparkles,
  CheckCircle2,
  Smile,
} from 'lucide-react';

const BODY_SENSATIONS = [
  { id: 'ligero', label: '🌱 Ligera y con energía', color: '#10b981' },
  { id: 'satisfecho', label: '🥗 Satisfecha y en balance', color: '#06b6d4' },
  { id: 'fuerte', label: '⚡ Fuerte / Post-entreno', color: '#f97316' },
  { id: 'pesado', label: '🥱 Pesada / Con sueño', color: '#f59e0b' },
];

const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno', icon: '🍳' },
  { id: 'almuerzo', label: 'Almuerzo', icon: '🥗' },
  { id: 'cena', label: 'Cena', icon: '🍲' },
  { id: 'snack', label: 'Snack / Merienda', icon: '🍎' },
];

const MealPhotoThumb: React.FC<{ photoId: string }> = ({ photoId }) => {
  const { src, loading } = useAuthenticatedImage(nutritionApi.getMealPhotoViewUrl(photoId));
  if (loading) return <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cargando foto...</div>;
  if (!src) return null;

  return (
    <img
      src={src}
      alt="Comida"
      style={{
        width: '100%',
        height: '160px',
        objectFit: 'cover',
        borderRadius: 'var(--radius-sm)',
        marginTop: '10px',
      }}
    />
  );
};

export const NutritionPage: React.FC = () => {
  const { showToast, celebrate } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterSummary, setWaterSummary] = useState<WaterSummary | null>(null);
  const [references, setReferences] = useState<any>(null);

  const [isMealModalOpen, setIsMealModalOpen] = useState<boolean>(false);
  const [mealDescription, setMealDescription] = useState<string>('');
  const [mealType, setMealType] = useState<string>('almuerzo');
  const [mealSensation, setMealSensation] = useState<string>('satisfecho');
  const [mealPhoto, setMealPhoto] = useState<File | null>(null);
  const [mealPhotoPreview, setMealPhotoPreview] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealsRes, waterRes, refsRes] = await Promise.all([
        nutritionApi.listMeals(),
        nutritionApi.getWaterSummary(),
        nutritionApi.getReferences(),
      ]);
      setMeals(mealsRes.data);
      setWaterSummary(waterRes.data);
      setReferences(refsRes.data);
    } catch (err: any) {
      showToast('Error cargando nutrición', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sensationObj = BODY_SENSATIONS.find((s) => s.id === mealSensation);
      const formattedDescription = sensationObj
        ? `[${sensationObj.label}] ${mealDescription}`.trim()
        : mealDescription;

      await nutritionApi.logMeal({
        description: formattedDescription || undefined,
        meal_type: mealType || undefined,
        photo: mealPhoto || undefined,
      });

      showToast('¡Comida Registrada!', 'Buen trabajo manteniendo tu registro de hábitos.', 'success');
      celebrate();
      setIsMealModalOpen(false);
      setMealDescription('');
      setMealSensation('satisfecho');
      setMealPhoto(null);
      setMealPhotoPreview(null);
      loadData();
    } catch (err: any) {
      showToast('Error al registrar comida', err.message, 'error');
    }
  };

  const handleDeleteMeal = async (mealId: number) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de comida?')) return;
    try {
      await nutritionApi.deleteMeal(mealId);
      showToast('Registro eliminado', '', 'info');
      loadData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0 }}>
            NUTRICIÓN & HÁBITOS SALUDABLES
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Registro rápido de hidratación y comidas enfocado en sensaciones corporales y constancia, sin dietas estrictas ni pesaje.
          </p>
        </div>

        <button
          onClick={() => setIsMealModalOpen(true)}
          className="btn btn-primary"
          style={{ boxShadow: '0 0 20px var(--color-primary-glow)' }}
        >
          <Plus size={18} /> Registrar Comida Rápida
        </button>
      </div>

      {/* 1. Water Tracker Widget (100% PRESERVED) */}
      <WaterTracker
        currentMl={waterSummary?.total_ml || 0}
        targetMl={2200}
        onWaterUpdated={loadData}
      />

      {/* 2. Habits Tips Card */}
      {references && (
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div style={{ color: '#10b981', marginTop: '2px' }}>
            <Lightbulb size={24} />
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, marginBottom: '4px' }}>
              Pautas de Nutrición Consciente
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              {references.habits?.tip} {references.protein?.tip}
            </p>
          </div>
        </div>
      )}

      {/* 3. Meals Log History */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Utensils size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
            Registro de Comidas Recientes ({meals.length})
          </h3>
        </div>

        {meals.length === 0 ? (
          <div className="glass-card flex-center" style={{ padding: '36px', flexDirection: 'column', color: 'var(--text-muted)', gap: '10px' }}>
            <Apple size={32} color="var(--text-dim)" />
            <p>No has registrado comidas todavía.</p>
            <button
              onClick={() => setIsMealModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={16} /> Registrar lo que comiste hoy
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {meals.map((meal) => {
              // Parse sensation tag if present in description
              const sensationMatch = meal.description?.match(/^\[(.*?)\]\s*(.*)$/);
              const sensationText = sensationMatch ? sensationMatch[1] : null;
              const cleanDescription = sensationMatch ? sensationMatch[2] : meal.description;

              return (
                <div key={meal.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                        {meal.meal_type || 'Comida'}
                      </span>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Eliminar registro"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {sensationText && (
                      <div style={{ marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            display: 'inline-block',
                          }}
                        >
                          {sensationText}
                        </span>
                      </div>
                    )}

                    <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500, marginBottom: '6px' }}>
                      {cleanDescription || 'Comida registrada sin notas'}
                    </div>

                    {meal.photos && meal.photos.length > 0 && (
                      <MealPhotoThumb photoId={meal.photos[0].id} />
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '12px' }}>
                    <Clock size={12} />
                    <span>
                      {new Date(meal.logged_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* UPGRADED MODAL: RAPID 3-CLICK MEAL LOGGER */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setMealPhoto(null);
          setMealPhotoPreview(null);
        }}
        title="Registro Rápido de Comida"
        maxWidth="540px"
      >
        <form onSubmit={handleSaveMeal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1: Meal Type Chips */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              1. Tipo de Comida
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {MEAL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setMealType(type.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: mealType === type.id ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: mealType === type.id ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    color: mealType === type.id ? '#fff' : 'var(--text-muted)',
                    fontWeight: mealType === type.id ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Body Sensation Pills */}
          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              2. ¿Cómo te sientes después de comer?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {BODY_SENSATIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setMealSensation(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: mealSensation === s.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: mealSensation === s.id ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                    color: mealSensation === s.id ? '#fff' : 'var(--text-muted)',
                    fontWeight: mealSensation === s.id ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                  }}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Photo (Optional) */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
              3. Foto del Plato (Opcional)
            </label>
            <div
              className="glass-card flex-center"
              style={{
                height: '130px',
                border: '2px dashed var(--border-glass)',
                flexDirection: 'column',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => document.getElementById('meal-photo-picker')?.click()}
            >
              {mealPhotoPreview ? (
                <img
                  src={mealPhotoPreview}
                  alt="Meal preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <>
                  <Camera size={24} color="var(--text-muted)" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                    Toca para subir o tomar foto
                  </span>
                </>
              )}
              <input
                type="file"
                id="meal-photo-picker"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setMealPhoto(file);
                    setMealPhotoPreview(URL.createObjectURL(file));
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Optional notes text */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Notas breves (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Ensalada con pollo y palta"
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsMealModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <CheckCircle2 size={16} /> Guardar Registro
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
