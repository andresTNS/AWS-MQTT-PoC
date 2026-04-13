-- =============================================================================
-- Script  : 02_seed_data.sql
-- Proyecto : DeepFlow IoT Dashboard
-- Desc.    : Datos base iniciales - dispositivo inicial Milesight UR41-L08AU
-- Nota     : Ejecutar después de 01_create_database.sql
-- =============================================================================

USE poc_dataflow;

-- -----------------------------------------------------------------------------
-- Dispositivo inicial del PoC
-- INSERT IGNORE es idempotente: no falla si el script se ejecuta más de una vez
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO devices
    (mac_address, nombre, modelo, topic_mqtt, descripcion, activo)
VALUES
    (
        '60:53:05:7A:D6:F2',
        'UR41 Maqueta PoC',
        'Milesight UR41-L08AU',
        'dispositivos/ur41/telemetria',
        'Dispositivo de maqueta para el PoC - DeepFlow IoT Dashboard',
        1
    );

-- -----------------------------------------------------------------------------
-- Verificación: mostrar el dispositivo insertado
-- -----------------------------------------------------------------------------
SELECT
    id,
    mac_address,
    nombre,
    topic_mqtt,
    activo,
    created_at
FROM devices
ORDER BY id;
