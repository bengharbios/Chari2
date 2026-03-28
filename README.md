# 🛒 TakZone - منصة التجارة الإلكترونية الشاملة

منصة تجارة إلكترونية عربية متكاملة تدعم 4 لوحات تحكم: Admin، Store، Merchant، Buyer

## ✨ المميزات

- 🌐 **دعم RTL كامل** - تصميم عربي أصيل
- 📱 **متجاوب** - يعمل على جميع الأجهزة
- 🔐 **نظام مصادقة متكامل** - OTP، JWT، Sessions
- 👥 **4 لوحات تحكم** - لكل دور واجهة خاصة
- 🗄️ **MySQL** - قاعدة بيانات قوية للإنتاج

## 🛠️ التقنيات

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Database:** Prisma ORM, MySQL
- **Auth:** JWT, NextAuth.js

## 🚀 النشر على Hostinger

### 1. إعداد GitHub Secrets

اذهب إلى Settings → Secrets and variables → Actions وأضف:

| Secret | الوصف |
|--------|-------|
| `DATABASE_URL` | رابط اتصال MySQL |
| `NEXTAUTH_URL` | رابط الموقع |
| `NEXTAUTH_SECRET` | مفتاح سري (32+ حرف) |

### 2. إعداد قاعدة البيانات

```bash
# تشغيل Migrations
npx prisma migrate deploy

# أو استخدام db:push
npx prisma db push
```

### 3. إعداد Hostinger

- **Framework:** Express
- **Entry file:** server.js
- **Node version:** 22.x
- **Environment Variables:** نفس GitHub Secrets

## 👨‍💻 المطور

**Kadir Bengharbi**

---

## 📄 الرخصة

هذا المشروع ملك خاص ولا يجوز استخدامه دون إذن.
