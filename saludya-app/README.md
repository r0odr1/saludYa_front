# 🏥 SaludYa App — Guía de instalación y ejecución

Aplicación Angular 19 para la gestión de citas de fisioterapia.

---

## ✅ Requisitos previos

Antes de instalar, asegúrate de tener:

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Node.js | 18.x o superior | `node -v` |
| npm | 9.x o superior | `npm -v` |
| Angular CLI | 17.x o superior | `ng version` |

> Si no tienes Angular CLI instalado:
> ```bash
> npm install -g @angular/cli
> ```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/r0odr1/saludYa_front.git
cd saludYa_front/saludya-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el entorno

Edita el archivo `src/environments/environment.ts` y asegúrate de que apunte al backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

> ⚠️ El backend debe estar corriendo en `http://localhost:3000` antes de levantar el frontend.

---

## ▶️ Ejecución en desarrollo

```bash
ng serve
```

Abre el navegador en: **`http://localhost:4200`**

La aplicación se recarga automáticamente al guardar cambios.

---

## 📁 Estructura del proyecto

```
saludya-app/
├── src/
│   ├── app/
│   │   ├── components/layout/navbar/    # Navbar con dropdown de perfil
│   │   ├── guards/                      # authGuard - protección de rutas
│   │   ├── interceptors/                # tokenInterceptor - JWT automático
│   │   ├── services/
│   │   │   ├── auth.service.ts          # Login, registro, verificación
│   │   │   ├── cita.service.ts          # Citas, disponibilidad, agenda
│   │   │   └── admin.service.ts         # Doctores, especialidades, usuarios
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── registro/
│   │   │   ├── verificar-cuenta/        # Input 6 dígitos con auto-avance
│   │   │   ├── solicitar-reset/
│   │   │   ├── verificar-reset/
│   │   │   ├── nueva-contrasena/
│   │   │   ├── perfil/                  # Editar info + cambiar contraseña
│   │   │   ├── paciente/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── especialidades/
│   │   │   │   ├── agendar-cita/        # Stepper 5 pasos
│   │   │   │   └── mis-citas/           # Modal cancelar + restricción 3h
│   │   │   ├── doctor/
│   │   │   │   ├── dashboard-doctor/
│   │   │   │   ├── agenda/              # Notas, reasignar, completar
│   │   │   │   └── historial-paciente/
│   │   │   └── admin/
│   │   │       ├── dashboard-admin/
│   │   │       ├── gestionar-doctores/
│   │   │       ├── gestionar-especialidades/
│   │   │       ├── gestionar-usuarios/  # Cambio de roles
│   │   │       ├── gestionar-citas/
│   │   │       └── reportes/
│   │   ├── app.routes.ts                # 20+ rutas con lazy loading
│   │   ├── app.component.ts
│   │   └── app.config.ts
│   ├── environments/
│   │   ├── environment.ts               # Desarrollo (localhost:3000)
│   │   └── environment.prod.ts          # Producción
│   ├── styles.scss                      # Variables CSS globales + utilidades
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🏗️ Compilar para producción

```bash
ng build
```

Los archivos compilados quedan en la carpeta `dist/`. Listos para desplegar en cualquier servidor estático (Nginx, Apache, Firebase Hosting, etc.).

---

## 🧪 Ejecutar pruebas

```bash
# Pruebas unitarias
ng test
```

---

## 🔗 Backend relacionado

Este frontend consume la API REST del backend **SaludYa**:

```
https://github.com/r0odr1/saludYa_back
```

Asegúrate de tener el backend corriendo antes de usar la app.

---

## 🐛 Problemas que se presentaran

> ⚠️ Se generaran problemas ya que no estan las variables de entorno, es necesario solicitarlas.
