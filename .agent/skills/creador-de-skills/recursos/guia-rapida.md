# Guía Rápida: Crear Skills

## Checklist de nombre

- [ ] Minúsculas
- [ ] Guiones (no guiones bajos)
- [ ] Máximo 40 caracteres
- [ ] Sin nombres de herramientas
- [ ] Descriptivo y operativo

## Checklist de descripción

- [ ] En español
- [ ] Tercera persona
- [ ] Máximo 220 caracteres
- [ ] Dice QUÉ hace
- [ ] Dice CUÁNDO usarlo

## Niveles de libertad

| Nivel | Uso                  | Ejemplo                              |
| ----- | -------------------- | ------------------------------------ |
| Alta  | Brainstorming, ideas | "Genera 5 alternativas de..."        |
| Media | Documentos, copys    | "Usa esta plantilla y adapta..."     |
| Baja  | Scripts, comandos    | "Ejecuta exactamente estos pasos..." |

**Regla**: Más riesgo = más específico

## Estructura mínima

```
.agent/skills/<nombre>/
└── SKILL.md          # Siempre obligatorio
```

## Estructura completa (si aplica)

```
.agent/skills/<nombre>/
├── SKILL.md          # Lógica y reglas
├── recursos/         # Guías, plantillas, tokens
├── scripts/          # Utilidades ejecutables
└── ejemplos/         # Implementaciones de referencia
```

## Formato YAML obligatorio

```yaml
---
name: nombre-en-minusculas
description: Descripción en tercera persona, máximo 220 chars.
---
```

## Secciones obligatorias del SKILL.md

1. **Cuándo usar este skill** - Triggers claros
2. **Inputs necesarios** - Qué datos se requieren
3. **Workflow** - Pasos a seguir
4. **Instrucciones** - Detalles de ejecución
5. **Output** - Formato exacto de salida

## Errores comunes

| Error                  | Corrección             |
| ---------------------- | ----------------------- |
| Nombre con mayúsculas | Usar minúsculas        |
| Descripción muy larga | Recortar a 220 chars    |
| Triggers vagos         | Hacerlos específicos   |
| Sin formato de output  | Definir formato exacto  |
| Demasiados archivos    | Solo crear lo necesario |
