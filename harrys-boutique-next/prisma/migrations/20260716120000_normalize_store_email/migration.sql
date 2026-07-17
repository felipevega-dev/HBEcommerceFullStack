UPDATE "settings"
SET
  "value" = 'contacto@harrysboutique.cl',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE
  "key" = 'store_email'
  AND LOWER(TRIM("value")) IN (
    'contacto@harrys-boutique.com',
    'hola@harrys-boutique.com'
  );
