/**
 * Buyer Addresses Page
 * Address management with CRUD operations
 */

'use client';

import { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Home,
  Building,
  CheckCircle,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Mock addresses data
const initialAddresses = [
  {
    id: '1',
    label: 'المنزل',
    recipientName: 'أحمد محمد العتيبي',
    phone: '0512345678',
    country: 'السعودية',
    city: 'الرياض',
    district: 'النرجس',
    street: 'شارع الأمير سلطان بن عبدالعزيز',
    buildingNo: '1234',
    floorNo: '3',
    apartmentNo: '12',
    postalCode: '12345',
    additionalInstructions: 'الشقة في الدور الثالث، باب اليمين',
    isDefault: true,
  },
  {
    id: '2',
    label: 'العمل',
    recipientName: 'أحمد محمد العتيبي',
    phone: '0512345678',
    country: 'السعودية',
    city: 'الرياض',
    district: 'العليا',
    street: 'طريق الملك فهد',
    buildingNo: '5678',
    floorNo: '15',
    apartmentNo: '1501',
    postalCode: '54321',
    additionalInstructions: 'المكتب في البرج الأول',
    isDefault: false,
  },
  {
    id: '3',
    label: 'منزل الأهل',
    recipientName: 'محمد عبدالله العتيبي',
    phone: '0598765432',
    country: 'السعودية',
    city: 'جدة',
    district: 'الحمرة',
    street: 'شارع الأمير ماجد',
    buildingNo: '789',
    floorNo: '1',
    apartmentNo: null,
    postalCode: '21451',
    additionalInstructions: 'الفيلا البيضاء بجوار المسجد',
    isDefault: false,
  },
];

// Saudi cities
const saudiCities = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الظهران',
  'الطائف',
  'تبوك',
  'بريدة',
  'عنيزة',
  'الأحساء',
  'حائل',
  'نجران',
  'جازان',
  'أبها',
  'خميس مشيط',
  'القطيف',
  'ينبع',
  'الخرج',
];

const addressLabels = [
  { value: 'home', label: 'المنزل', icon: Home },
  { value: 'work', label: 'العمل', icon: Building },
  { value: 'family', label: 'منزل الأهل', icon: Home },
  { value: 'other', label: 'آخر', icon: MapPin },
];

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  street: string;
  buildingNo: string;
  floorNo: string | null;
  apartmentNo: string | null;
  postalCode: string;
  additionalInstructions: string | null;
  isDefault: boolean;
}

function AddressForm({
  address,
  onSave,
  onCancel,
}: {
  address?: Address | null;
  onSave: (data: Partial<Address>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Address>>({
    label: address?.label || 'المنزل',
    recipientName: address?.recipientName || '',
    phone: address?.phone || '',
    country: 'السعودية',
    city: address?.city || '',
    district: address?.district || '',
    street: address?.street || '',
    buildingNo: address?.buildingNo || '',
    floorNo: address?.floorNo || '',
    apartmentNo: address?.apartmentNo || '',
    postalCode: address?.postalCode || '',
    additionalInstructions: address?.additionalInstructions || '',
    isDefault: address?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Address Type */}
      <div className="space-y-2">
        <Label>نوع العنوان</Label>
        <div className="flex flex-wrap gap-2">
          {addressLabels.map((label) => (
            <Button
              key={label.value}
              type="button"
              variant={formData.label === label.label ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setFormData({ ...formData, label: label.label })}
            >
              <label.icon className="h-4 w-4" />
              {label.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipient Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipientName">اسم المستلم *</Label>
          <Input
            id="recipientName"
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            placeholder="الاسم الكامل"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الجوال *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="05xxxxxxxx"
            type="tel"
            required
          />
        </div>
      </div>

      <Separator />

      {/* Address Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">المدينة *</Label>
          <Select
            value={formData.city}
            onValueChange={(value) => setFormData({ ...formData, city: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              {saudiCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">الحي *</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder="اسم الحي"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">اسم الشارع *</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="اسم الشارع"
          required
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buildingNo">رقم المبنى *</Label>
          <Input
            id="buildingNo"
            value={formData.buildingNo}
            onChange={(e) => setFormData({ ...formData, buildingNo: e.target.value })}
            placeholder="1234"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="floorNo">الدور</Label>
          <Input
            id="floorNo"
            value={formData.floorNo || ''}
            onChange={(e) => setFormData({ ...formData, floorNo: e.target.value })}
            placeholder="3"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apartmentNo">رقم الشقة</Label>
          <Input
            id="apartmentNo"
            value={formData.apartmentNo || ''}
            onChange={(e) => setFormData({ ...formData, apartmentNo: e.target.value })}
            placeholder="12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">الرمز البريدي</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            placeholder="12345"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalInstructions">تعليمات إضافية</Label>
        <Textarea
          id="additionalInstructions"
          value={formData.additionalInstructions || ''}
          onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
          placeholder="ملاحظات لتوصيل الشحنة (اختياري)"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          تعيين كعنوان افتراضي
        </Label>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">حفظ العنوان</Button>
      </DialogFooter>
    </form>
  );
}

export default function BuyerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const handleAddAddress = (data: Partial<Address>) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      label: data.label || 'المنزل',
      recipientName: data.recipientName || '',
      phone: data.phone || '',
      country: data.country || 'السعودية',
      city: data.city || '',
      district: data.district || '',
      street: data.street || '',
      buildingNo: data.buildingNo || '',
      floorNo: data.floorNo || null,
      apartmentNo: data.apartmentNo || null,
      postalCode: data.postalCode || '',
      additionalInstructions: data.additionalInstructions || null,
      isDefault: data.isDefault || false,
    };

    // If new address is default, remove default from others
    if (newAddress.isDefault) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: false }))
      );
    }

    setAddresses((prev) => [...prev, newAddress]);
    setIsAddDialogOpen(false);
  };

  const handleEditAddress = (data: Partial<Address>) => {
    if (!editingAddress) return;

    // If edited address is default, remove default from others
    if (data.isDefault) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: false }))
      );
    }

    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === editingAddress.id ? { ...addr, ...data } : addr
      )
    );
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    setDeletingAddressId(null);
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">عناويني</h1>
          <p className="text-muted-foreground">إدارة عناوين الشحن والتوصيل</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عنوان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                إضافة عنوان جديد
              </DialogTitle>
            </DialogHeader>
            <AddressForm
              onSave={handleAddAddress}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              لا توجد عناوين محفوظة
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              أضف عنوانك الأول لتسهيل عملية الشراء والتوصيل
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عنوان
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`relative overflow-hidden transition-all hover:shadow-md ${
                address.isDefault ? 'border-primary border-2' : ''
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {address.label === 'المنزل' && <Home className="h-5 w-5 text-primary" />}
                    {address.label === 'العمل' && <Building className="h-5 w-5 text-primary" />}
                    {(address.label === 'منزل الأهل' || address.label === 'آخر') && (
                      <MapPin className="h-5 w-5 text-primary" />
                    )}
                    {address.label}
                  </CardTitle>
                  {address.isDefault && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 ml-1" />
                      الافتراضي
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Recipient Info */}
                <div>
                  <p className="font-medium text-foreground">{address.recipientName}</p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                </div>

                <Separator />

                {/* Address */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {address.city}، {address.district}
                  </p>
                  <p>{address.street}</p>
                  <p>
                    مبنى رقم {address.buildingNo}
                    {address.floorNo && `، الدور ${address.floorNo}`}
                    {address.apartmentNo && `، شقة ${address.apartmentNo}`}
                  </p>
                  {address.postalCode && (
                    <p>الرمز البريدي: {address.postalCode}</p>
                  )}
                </div>

                {address.additionalInstructions && (
                  <div className="p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                    {address.additionalInstructions}
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => setEditingAddress(address)}
                        >
                          <Edit2 className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="h-5 w-5 text-primary" />
                            تعديل العنوان
                          </DialogTitle>
                        </DialogHeader>
                        <AddressForm
                          address={editingAddress}
                          onSave={handleEditAddress}
                          onCancel={() => setEditingAddress(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeletingAddressId(address.id)}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      تعيين كافتراضي
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAddressId}
        onOpenChange={() => setDeletingAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العنوان</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا العنوان؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingAddressId && handleDeleteAddress(deletingAddressId)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Map Integration Note */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium text-foreground">تحديد الموقع على الخريطة</p>
            <p className="text-sm text-muted-foreground">
              يمكنك تحديد موقعك بدقة على الخريطة لتسهيل عملية التوصيل
            </p>
          </div>
          <Button variant="outline" className="mr-auto">
            فتح الخريطة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
