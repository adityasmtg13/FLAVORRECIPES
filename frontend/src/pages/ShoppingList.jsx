import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api'

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Grains', 'Spices', 'Beverages', 'Other'];

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const[loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShoppingList();
    }, []);

    const fetchShoppingList = async () => {
        try {
            const response = await api.get('/api/shopping-list?grouped=true');
            const grouped = response.data.data.items;

            // Convert grouped format to flat array for easier manipulation
            const flatItems = [];
            grouped.forEach(group => {
                group.items.forEach(item => {
                    flatItems.push({ ...item, category: group.category });
                });
            });

            setItems(flatItems);
            organizeByCategory(flatItems);
        } catch (error) {
            toast.error('Failed to load shopping list');
        } finally {
            setLoading(false);
        }
    };

    const organizeByCategory = (itemsList) => {
        const grouped = {};
        itemsList.forEach(item => {
            const category = item.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        setGroupedItems(grouped);
    };

    const handleToggleChecked = async (id) => {
        try {
            await api.put(`/api/shopping-list/${id}/toggle`);

            const updatedItems = items.map(item =>
                item.id === id
                    ? { ...item, is_checked: !item.is_checked }
                    : item
            );

            setItems(updatedItems);
            organizeByCategory(updatedItems);
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await api.delete(`/api/shopping-list/${id}`);
            const updatedItems = items.filter(item => item.id !== id);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const handleClearChecked = async () => {
        if (!confirm('Remove all checked items?')) return;

        try {
            await api.delete('/api/shopping-list/clear/checked');
            const updatedItems = items.filter(item => !item.is_checked);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success('Checked items cleared');
        } catch (error) {
            toast.error('Failed to clear items');
        }
    };

    const handleAddToPantry = async () => {
        const checkedCount = items.filter(item => item.is_checked).length;
        if (checkedCount === 0) {
            toast.error('No items checked');
            return;
        }

        if (!confirm(`Add ${checkedCount} checked items to pantry?`)) return;

        try {
            await api.post('/api/shopping-list/add-to-pantry');
            const updatedItems = items.filter(item => !item.is_checked);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success('Items added to pantry');
        } catch (error) {
            toast.error('Failed to add items to pantry');
        }
    };

    if(loading){
        return(
            <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
                <Navbar/>
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C05800', borderTopColor: 'transparent' }}></div>
                </div>
            </div>
        );
    }

    const checkedCount = items.filter(item => item.is_checked).length;
    const totalCount = items.length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FDFBD4' }}>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold" style={{ color: '#38240D' }}>Shopping List</h1>
                    <p className="mt-1" style={{ color: '#713600' }}>
                        {totalCount > 0 ? `${checkedCount} of ${totalCount} items checked` : 'Your shopping list is empty'}
                    </p>
                </div>

                {/* Actions */}
                {totalCount > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition-colors hover:opacity-90"
                            style={{ backgroundColor: '#713600' }}
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                        {checkedCount > 0 && (
                            <>
                                <button
                                    onClick={handleAddToPantry}
                                    className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition-colors hover:opacity-90"
                                    style={{ backgroundColor: '#C05800' }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Pantry ({checkedCount})
                                </button>
                                <button
                                    onClick={handleClearChecked}
                                    className="flex items-center gap-2 border px-4 py-2.5 rounded-lg font-medium transition-colors"
                                    style={{ borderColor: '#C05800', color: '#38240D' }}
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Clear Checked
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Shopping List */}
                {totalCount > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <div key={category} className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
                                <div className="px-6 py-3 border-b" style={{ backgroundColor: '#FDFBD4', borderColor: '#C05800' }}>
                                    <h2 className="font-semibold" style={{ color: '#38240D' }}>{category}</h2>
                                </div>
                                <div className="divide-y" style={{ divideColor: '#C05800' }}>
                                    {categoryItems.map(item => (
                                        <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            onToggle={handleToggleChecked}
                                            onDelete={handleDeleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: '#fff', borderColor: '#C05800' }}>
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: '#C05800', opacity: 0.3 }} />
                        <p className="mb-4" style={{ color: '#713600' }}>Your shopping list is empty</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-medium transition-colors hover:opacity-90"
                            style={{ backgroundColor: '#713600' }}
                        >
                            <Plus className="w-5 h-5" />
                            Add First Item
                        </button>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newItem) => {
                        // Add to local state
                        const updatedItems = [...items, newItem];
                        setItems(updatedItems);
                        organizeByCategory(updatedItems);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

const ShoppingListItem = ({ item, onToggle, onDelete }) => {
    return (
        <div className="flex items-center gap-4 px-6 py-4 transition-colors group" style={{ backgroundColor: item.is_checked ? '#FDFBD4' : '#fff' }}>
            <button
                onClick={() => onToggle(item.id)}
                className="shrink-0"
            >
                <div className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all" style={{
                    backgroundColor: item.is_checked ? '#713600' : 'transparent',
                    borderColor: item.is_checked ? '#713600' : '#C05800'
                }}>
                    {item.is_checked && <Check className="w-4 h-4 text-white" />}
                </div>
            </button>

            <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ textDecoration: item.is_checked ? 'line-through' : 'none', color: item.is_checked ? '#C05800' : '#38240D' }}>
                    {item.ingredient_name}
                </p>
                <p className="text-sm" style={{ color: item.is_checked ? '#C05800' : '#713600' }}>
                    {item.quantity} {item.unit}
                    {item.from_meal_plan && (
                        <span className="ml-2 text-xs" style={{ color: '#713600' }}>• From meal plan</span>
                    )}
                </p>
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="shrink-0 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                style={{ color: '#C05800' }}
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ingredient_name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await api.post('/api/shopping-list', {
                ...formData,
                quantity: parseFloat(formData.quantity)
            });

            toast.success('Item added to shopping list');
            onSuccess(response.data.data.item);
            onClose();
        } catch (error) {
            toast.error('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="rounded-xl max-w-md w-full p-6" style={{ backgroundColor: '#FDFBD4' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: '#38240D' }}>Add Item</h2>
                    <button onClick={onClose} style={{ color: '#C05800' }}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Item Name</label>
                        <input
                            type="text"
                            value={formData.ingredient_name}
                            onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                            style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                                style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                                style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                            >
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="cups">Cups</option>
                                <option value="tbsp">Tablespoons</option>
                                <option value="tsp">Teaspoons</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#38240D' }}>Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                            style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff', '--tw-ring-color': '#713600' }}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border rounded-lg font-medium transition-colors"
                            style={{ borderColor: '#C05800', color: '#38240D', backgroundColor: '#fff' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 hover:opacity-90"
                            style={{ backgroundColor: '#713600' }}
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShoppingList;
