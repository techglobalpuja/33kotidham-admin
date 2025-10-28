# Recommended Puja Integration in Temple Management

## ✅ Implementation Complete

The Temple management feature now includes full recommended puja integration, allowing admins to associate pujas with temples when creating, updating, and viewing temple details.

---

## 🎨 Features Implemented

### **1. Create Temple - Recommended Puja Selection**
- **Beautiful Card Layout**: Pujas displayed in a responsive grid (1-2-3 columns)
- **Visual Selection**: Click-to-select cards with orange highlight
- **Check Mark Indicator**: Selected pujas show a checkmark badge
- **Puja Details Display**:
  - 📷 Temple image (full-width, 128px height with fallback emoji)
  - 📝 Puja name and sub-heading
  - 📅 Date badge (blue)
  - 🏷️ Category badge (purple)
- **Selection Counter**: Shows count of selected pujas
- **Auto-fetch**: Pujas loaded automatically on component mount

### **2. Update Temple - Recommended Puja Management**
- **Pre-selected Pujas**: Existing temple pujas are pre-selected
- **Compact Layout**: 2-column grid in modal with scrollable area
- **Same Selection UI**: Consistent with create form
- **Real-time Updates**: Changes reflected immediately

### **3. View Temple - Recommended Puja Display**
- **Enhanced Card Design**: Gradient background (purple-50 to purple-100)
- **Larger Images**: 80x80px temple images with shadow
- **Complete Information**:
  - Puja name (bold text)
  - Sub-heading (medium text)
  - Description (small text, 2-line clamp)
  - Date tag (blue)
  - Time tag (green)
  - Category tag (purple)
- **Grid Layout**: 2-column responsive grid
- **Hover Effects**: Shadow on hover for better UX

---

## 📁 Files Modified

### **1. CreateTempleForm.tsx**
```typescript
// Added imports
import { fetchPujas } from '@/store/slices/pujaSlice';

// Added to form data
interface TempleFormData {
  // ... existing fields
  recommended_puja_ids: number[];
}

// Fetch pujas on mount
useEffect(() => {
  dispatch(fetchChadawas());
  dispatch(fetchPujas());
}, [dispatch]);

// Include in temple creation
const templeData = {
  // ... existing fields
  recommended_puja_ids: formData.recommended_puja_ids,
};
```

**New Section Added**: Recommended Puja Selection UI (lines 395-495)
- Grid layout with selectable cards
- Large temple image preview
- Date and category badges
- Loading state
- Empty state
- Selection counter

### **2. UpdateTempleModal.tsx**
```typescript
// Added imports
import { fetchPujas } from '@/store/slices/pujaSlice';

// Added to form data
recommended_puja_ids: [] as number[]

// Pre-populate from temple data
const pujaIds = Array.isArray(templeData.recommended_pujas)
  ? templeData.recommended_pujas.map((p: any) => 
      typeof p.id === 'string' ? parseInt(p.id) : (p.id || p)
    )
  : [];

// Include in update payload
const updateData = {
  // ... existing fields
  recommended_puja_ids: formData.recommended_puja_ids,
};
```

**New Section Added**: Recommended Puja Selection UI (lines 416-505)
- Compact 2-column grid
- Max height with scroll
- Pre-selected state handling
- Temple image thumbnails

### **3. ViewTempleModal.tsx**
**Enhanced Section**: Recommended Pujas Display (lines 163-226)
- Changed from simple list to rich card grid
- Added gradient purple backgrounds
- Larger temple images with fallbacks
- Sub-heading and description display
- Date, time, and category tags
- Hover shadow effects

---

## 🔌 API Integration

### **Puja Endpoints Used:**
- ✅ `GET /api/v1/pujas/` - Fetch all pujas
  - Called in `CreateTempleForm` and `UpdateTempleModal`
  - Uses existing `fetchPujas()` from `pujaSlice`
  - Returns array of puja objects with full details

### **Temple API Updated:**
- ✅ `POST /api/v1/temples/` - Create with `recommended_puja_ids`
- ✅ `PUT /api/v1/temples/{id}` - Update with `recommended_puja_ids`
- ✅ `GET /api/v1/temples/{id}` - Returns temple with recommended_pujas array

---

## 🎯 Data Flow

### **Creating a Temple with Recommended Pujas:**
```
1. User opens "Add New Temple" tab
2. Component fetches all available pujas
3. User fills temple details
4. User selects pujas by clicking cards
5. Selected IDs stored in formData.recommended_puja_ids: [62, 64, 65]
6. On submit, templeData includes recommended_puja_ids array
7. API creates temple with puja associations
```

### **Updating Temple Recommended Pujas:**
```
1. User clicks Edit on a temple
2. Modal fetches temple details
3. Existing pujas extracted: temple.recommended_pujas.map(p => p.id)
4. Puja cards pre-selected based on IDs
5. User can add/remove pujas
6. On submit, updated recommended_puja_ids sent to API
7. Temple puja associations updated
```

### **Viewing Temple with Recommended Pujas:**
```
1. User clicks View on a temple
2. Modal receives temple data with recommended_pujas array
3. Each puja object contains:
   {
     id: number | string,
     name: string,
     sub_heading: string,
     description: string,
     temple_image_url: string,
     date: string,
     time: string,
     category: string,
     benefits: [],
     images: []
   }
4. Pujas displayed in enhanced card layout
```

---

## 🎨 UI/UX Highlights

### **Selection Interaction:**
- ✅ **Click to Toggle**: Tap card to select/deselect
- ✅ **Visual Feedback**: Orange border + background when selected
- ✅ **Checkmark Badge**: Shows in top-right of selected cards
- ✅ **Counter Display**: "✓ 3 pujas selected"

### **Responsive Design:**
- **Mobile (< 768px)**: 1 column
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 3 columns (Create), 2 columns (Update/View)

### **Loading States:**
- ✅ Spinner with "Loading pujas..." message
- ✅ Empty state with emoji and message

### **Error Handling:**
- ✅ Image load failures fallback to emoji placeholder
- ✅ Missing data handled with default values
- ✅ ID type conversion (string to number)

---

## 💅 Styling Details

### **Selected Card (Create/Update):**
```css
border: 2px solid #f97316 (orange-500)
background: #ffedd5 (orange-50)
```

### **Unselected Card:**
```css
border: 2px solid #e5e7eb (gray-200)
background: white
hover:border: #fdba74 (orange-300)
```

### **View Modal Cards:**
```css
background: gradient from purple-50 to purple-100
border: 1px solid purple-200
hover: shadow-md
```

---

## 📊 Data Structure

### **Puja Object (API Response):**
```typescript
interface Puja {
  id: number | string;
  name: string;
  sub_heading: string;
  description: string;
  date: string | null;
  time: string | null;
  temple_image_url: string;
  temple_address: string;
  temple_description: string;
  prasad_price: number;
  is_prasad_active: boolean;
  dakshina_prices_inr: string;
  dakshina_prices_usd: string;
  is_dakshina_active: boolean;
  manokamna_prices_inr: string;
  manokamna_prices_usd: string;
  is_manokamna_active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
  benefits: Benefit[];
  images: Image[];
  plan_ids: number[];
  chadawas: any[];
}
```

### **Temple with Recommended Pujas:**
```typescript
interface Temple {
  // ... other fields
  recommended_pujas: Puja[];
}
```

### **Form Data:**
```typescript
interface TempleFormData {
  // ... other fields
  recommended_puja_ids: number[];
}
```

---

## ✨ User Journey

### **Creating a Temple:**
1. Navigate to "Manage Temples" → "Add New Temple"
2. Upload temple image and fill details
3. Scroll to "Select Chadawas" section (optional)
4. Scroll to "Select Recommended Pujas" section
5. Browse available pujas in grid with temple images
6. Click puja cards to select (multiple selection)
7. See selection count update
8. Click "Create Temple"
9. Temple created with pujas and chadawas!

### **Updating Temple Pujas:**
1. Go to "All Temples"
2. Click "Edit" (✏️) on any temple
3. Modal opens with pre-selected pujas
4. Add or remove pujas by clicking cards
5. Click "Update Temple"
6. Temple recommended pujas updated

### **Viewing Temple Pujas:**
1. Go to "All Temples"
2. Click "View" (👁️) on any temple
3. See temple details
4. Scroll to "Recommended Pujas" section
5. See beautiful purple gradient cards with:
   - Temple images
   - Puja names, sub-headings, descriptions
   - Date, time, category tags
6. Scroll to "Associated Chadawas" section
7. Close modal

---

## 🔄 State Management

### **Redux Store:**
```typescript
// Puja state from pujaSlice
const { pujas, isLoading } = useSelector(
  (state: RootState) => state.puja
);
```

### **Local State:**
```typescript
// Form data with puja IDs
const [formData, setFormData] = useState({
  // ... other fields
  recommended_puja_ids: [],
});
```

---

## 🎉 Benefits

1. **Rich Information**: See puja details with images before selecting
2. **Visual Selection**: Easy to browse with large temple images
3. **Complete Context**: Date, category, and sub-heading visible
4. **Flexible**: Can select any number of pujas
5. **Consistent**: Same interaction pattern as chadawa selection
6. **Beautiful UI**: Modern gradient card-based design
7. **Responsive**: Works on all devices
8. **Performant**: Efficient data fetching and rendering

---

## 📝 Comparison: Pujas vs Chadawas

| Feature | Pujas | Chadawas |
|---------|-------|----------|
| **Color Scheme** | Purple gradient | Orange gradient |
| **Image Size** | Full-width in card | 64x64px thumbnail |
| **Main Info** | Name + Sub-heading + Description | Name + Description + Price |
| **Tags** | Date, Time, Category | Price, "Note Required" |
| **Layout** | Vertical card | Horizontal card |
| **Icon** | 🛕 | 🛍️ |

---

## 📱 Display Examples

### **Create Form - Puja Card:**
```
┌──────────────────────────────┐
│ [Temple Image - 128px high]  │ ✓
├──────────────────────────────┤
│ Puja Name (bold)             │
│ Sub-heading (gray)           │
│ 📅 Oct 29 | 🏷️ general      │
└──────────────────────────────┘
```

### **View Modal - Puja Card:**
```
┌───────────────────────────────────────┐
│  [80x80]  Puja Name (bold)           │
│   Image   Sub-heading (medium)       │
│           Description (small)         │
│           📅 Date 🕐 Time 🏷️ Category│
└───────────────────────────────────────┘
```

---

## 🚀 Next Steps (Optional Enhancements)

1. **Search/Filter**: Add search to filter pujas by name or category
2. **Categories**: Group pujas by category (general, prosperity, health, etc.)
3. **Sorting**: Sort by date, popularity, or name
4. **Bulk Actions**: Select all / Clear all buttons
5. **Preview**: Show list of selected pujas before submit
6. **Validation**: Minimum/maximum puja selection limits
7. **Quick View**: Hover tooltip with more puja details

---

## 🎯 Key Differences from Chadawa Integration

1. **Visual Focus**: Pujas show larger temple images (full-width)
2. **More Metadata**: Display date, time, and category
3. **Purple Theme**: Uses purple color scheme vs orange for chadawas
4. **Vertical Layout**: Card content stacked vertically for better readability
5. **ID Handling**: Converts string IDs to numbers for consistency

---

## 🔧 Technical Notes

### **ID Type Conversion:**
The API sometimes returns puja IDs as strings ("62", "64") but the form expects numbers. The code handles this conversion:
```typescript
const pujaId = typeof puja.id === 'string' ? parseInt(puja.id) : puja.id;
```

### **Pre-selection Logic:**
When updating a temple, existing puja IDs are extracted and converted:
```typescript
const pujaIds = Array.isArray(templeData.recommended_pujas)
  ? templeData.recommended_pujas.map((p: any) => 
      typeof p.id === 'string' ? parseInt(p.id) : (p.id || p)
    )
  : [];
```

---

## ✅ Testing Checklist

- ✅ Create temple without pujas
- ✅ Create temple with multiple pujas
- ✅ Create temple with both pujas and chadawas
- ✅ View temple with pujas displays correctly with all details
- ✅ Update temple to add pujas
- ✅ Update temple to remove pujas
- ✅ Temple images load correctly with fallbacks
- ✅ Selection state updates in real-time
- ✅ Counter displays correct count
- ✅ Responsive layout on different screen sizes
- ✅ Loading state displays correctly
- ✅ Empty state displays when no pujas
- ✅ Date formatting works correctly
- ✅ Category tags display properly
- ✅ Pre-selection works in update modal

---

**Implementation Complete!** ✨

Your Temple management now has full recommended puja integration with a beautiful, intuitive UI that makes it easy to associate pujas with temples. The interface is consistent with chadawa selection but tailored to showcase puja-specific information like dates, times, and categories.

---

**Updated:** October 28, 2025  
**Framework:** Next.js 14 + TypeScript  
**UI Libraries:** Ant Design + Tailwind CSS  
**API Base:** https://api.33kotidham.com
