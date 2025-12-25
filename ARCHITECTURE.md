# Architecture Documentation - Smart Task Organizer

## نظرة عامة على البنية المعمارية

تم تصميم التطبيق باستخدام **MVC Pattern** و **Repository Pattern** لضمان فصل الاهتمامات وسهولة الصيانة والتطوير.

## البنية المعمارية

```
┌─────────────────────────────────────────────────────────┐
│                      Presentation Layer                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              TaskView (View)                      │  │
│  │  - displayTasks()                                 │  │
│  │  - renderTask()                                   │  │
│  │  - clearForm()                                    │  │
│  │  - openEditModal()                                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         TaskController (Controller)              │  │
│  │  - createTask()                                   │  │
│  │  - updateTask()                                   │  │
│  │  - deleteTask()                                   │  │
│  │  - toggleTaskStatus()                             │  │
│  │  - setFilter()                                    │  │
│  │  - setSort()                                      │  │
│  │  - exportTasks()                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                      Data Access Layer                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │        TaskRepository (Repository Pattern)       │  │
│  │  - getAll()                                       │  │
│  │  - getById()                                      │  │
│  │  - save()                                         │  │
│  │  - delete()                                       │  │
│  │  - exportToText()                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                      Data Model Layer                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Task (Model)                        │  │
│  │  - Properties: id, title, description, etc.      │  │
│  │  - Methods: update(), toggleStatus(), etc.       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                      Storage Layer                      │
│                    LocalStorage API                      │
│              (JSON Format - Readable)                   │
└─────────────────────────────────────────────────────────┘
```

## Design Patterns المستخدمة

### 1. MVC Pattern (Model-View-Controller)

#### Model (Task.js)
- **المسؤولية**: تمثيل كيان المهمة والمنطق المرتبط به
- **الوظائف**:
  - تخزين بيانات المهمة
  - إدارة حالة المهمة (ToDo/Completed)
  - التحقق من التأخير (isOverdue)
  - التحويل من/إلى JSON

#### View (TaskView.js)
- **المسؤولية**: عرض البيانات والتفاعل مع المستخدم
- **الوظائف**:
  - عرض قائمة المهام
  - عرض النماذج والنوافذ المنبثقة
  - معالجة إدخال المستخدم
  - تنسيق البيانات للعرض

#### Controller (TaskController.js)
- **المسؤولية**: التنسيق بين View و Repository
- **الوظائف**:
  - معالجة طلبات المستخدم
  - تطبيق منطق العمل
  - إدارة الفلترة والترتيب
  - التحقق من صحة البيانات

### 2. Repository Pattern (TaskRepository.js)

- **المسؤولية**: عزل منطق الوصول للبيانات
- **المزايا**:
  - إمكانية تغيير طريقة التخزين بسهولة
  - إخفاء تفاصيل التخزين عن طبقة العمل
  - سهولة الاختبار (يمكن استبدال Repository بـ Mock)

## تدفق البيانات

### إضافة مهمة جديدة (FR1)

```
User Input → TaskView → TaskController.createTask()
    ↓
TaskController.validate() → Task (new)
    ↓
TaskRepository.save() → LocalStorage
    ↓
TaskController.loadTasks() → TaskRepository.getAll()
    ↓
TaskView.displayTasks() → UI Update
```

### تعديل مهمة (FR2)

```
User Click Edit → TaskView.openEditModal()
    ↓
TaskController.startEdit() → TaskRepository.getById()
    ↓
TaskView displays form with data
    ↓
User submits → TaskController.updateTask()
    ↓
Task.update() → TaskRepository.save()
    ↓
TaskView.displayTasks() → UI Update
```

### حذف مهمة (FR3)

```
User Click Delete → TaskController.deleteTask()
    ↓
Confirmation → TaskRepository.delete()
    ↓
TaskController.loadTasks() → TaskView.displayTasks()
```

### الفلترة والترتيب (FR7, FR6)

```
User selects filter/sort → TaskController.setFilter/setSort()
    ↓
TaskController.applyFilterAndSort()
    ↓
Filter logic → Sort logic
    ↓
TaskView.displayTasks(filtered & sorted)
```

## إدارة الحالة (State Management)

- **Current Filter**: محفوظة في `TaskController.currentFilter`
- **Current Sort**: محفوظة في `TaskController.currentSort`
- **Current Edit ID**: محفوظة في `TaskController.currentEditId`
- **Tasks Data**: محفوظة في LocalStorage عبر Repository

## التخزين (Persistence)

### LocalStorage Structure

```json
{
  "smart_task_organizer_tasks": [
    {
      "id": "abc123",
      "title": "مهمة مثال",
      "description": "وصف المهمة",
      "deadline": "2024-12-31T23:59:00",
      "priority": "High",
      "status": "ToDo",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ]
}
```

### Auto-Save (FR8)
- يتم الحفظ تلقائياً عند كل عملية (إضافة/تعديل/حذف)
- يتم الحفظ أيضاً عند إغلاق الصفحة (beforeunload event)

### Auto-Load (FR9)
- يتم التحميل تلقائياً عند تحميل الصفحة (DOMContentLoaded event)

## الأداء (Performance)

### تحسينات الأداء المطبقة:

1. **Local Storage Caching**: البيانات محفوظة محلياً، لا حاجة لطلبات شبكة
2. **Efficient Rendering**: تحديث DOM فقط للمهام المتأثرة
3. **Event Delegation**: استخدام event listeners فعالة
4. **Response Time Monitoring**: مراقبة وقت الاستجابة (هدف: < 2 ثانية)

### قياس الأداء:

```javascript
const startTime = performance.now();
// Operation
const endTime = performance.now();
if (endTime - startTime > 2000) {
    console.warn('Operation took longer than 2 seconds');
}
```

## الأمان (Security)

1. **XSS Prevention**: استخدام `escapeHtml()` لتنظيف المدخلات
2. **Input Validation**: التحقق من صحة البيانات قبل الحفظ
3. **Local Storage**: البيانات محلية فقط، لا تنتقل عبر الشبكة


## جودة الكود (Code Quality)

### المبادئ المطبقة:

1. **Single Responsibility Principle**: كل كلاس له مسؤولية واحدة
2. **Separation of Concerns**: فصل واضح بين الطبقات
3. **DRY (Don't Repeat Yourself)**: تجنب التكرار
4. **Clean Code**: أسماء واضحة، تعليقات مفيدة
5. **Error Handling**: معالجة الأخطاء بشكل مناسب


## التوثيق (Documentation)

- ✅ README.md: دليل المستخدم
- ✅ ARCHITECTURE.md: هذا الملف - توثيق البنية

