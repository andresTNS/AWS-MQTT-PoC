-- =============================================================================
-- Script  : 01_create_database.sql
-- Proyecto : DeepFlow IoT Dashboard
-- Desc.    : Creación de la base de datos poc_dataflow y sus tablas
-- Motor    : MySQL 5.7+
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Base de datos
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS poc_dataflow
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE poc_dataflow;

-- -----------------------------------------------------------------------------
-- Tabla: devices
-- Catálogo de dispositivos Milesight registrados en el sistema.
-- Cada dispositivo se identifica de forma única por su MAC address.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devices (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    mac_address   VARCHAR(17)     NOT NULL COMMENT 'MAC address en formato XX:XX:XX:XX:XX:XX',
    nombre        VARCHAR(100)    NOT NULL COMMENT 'Nombre descriptivo del dispositivo',
    modelo        VARCHAR(100)    NOT NULL DEFAULT 'Milesight UR41-L08AU',
    topic_mqtt    VARCHAR(255)    NOT NULL COMMENT 'Topic MQTT al que publica el dispositivo',
    descripcion   TEXT                    COMMENT 'Información adicional del dispositivo',
    activo        TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '1=activo, 0=inactivo',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_mac_address (mac_address),
    INDEX        idx_activo    (activo)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Catálogo de dispositivos IoT registrados';

-- -----------------------------------------------------------------------------
-- Tabla: telemetria
-- Almacena cada mensaje MQTT recibido de los dispositivos.
-- Los campos GPS se guardan en formato WGS84 con signo (negativo = Sur/Oeste).
-- La columna datos_extra permite incorporar nuevos sensores sin alterar el esquema.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS telemetria (
    id                    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    device_id             INT UNSIGNED     NOT NULL COMMENT 'FK hacia devices.id',

    -- Timestamp enviado por el dispositivo en el payload (UTC)
    timestamp_dispositivo DATETIME         NOT NULL COMMENT 'Timestamp del payload del dispositivo (UTC)',

    -- Temperatura y sensor de corriente
    temperatura_c         DECIMAL(6,2)             COMMENT 'Temperatura procesada en grados Celsius',
    mA_raw                DECIMAL(8,4)             COMMENT 'Lectura raw del sensor en miliamperios (campo mA_raw del payload)',

    -- Coordenadas GPS en WGS84 con signo
    -- Latitud  : negativo = Sur,  positivo = Norte
    -- Longitud : negativo = Oeste, positivo = Este
    latitud               DECIMAL(10,7)            COMMENT 'Latitud WGS84 con signo (-=Sur, +=Norte)',
    longitud              DECIMAL(10,7)            COMMENT 'Longitud WGS84 con signo (-=Oeste, +=Este)',
    altura_m              DECIMAL(8,2)             COMMENT 'Altura sobre el nivel del mar en metros',
    velocidad_kmh         DECIMAL(10,6)            COMMENT 'Velocidad en km/h',
    gps_timestamp         DATETIME                 COMMENT 'Timestamp propio del GPS (gps.timestamp del payload, UTC)',

    -- Campos adicionales futuros sin romper el esquema (humedad, batería, etc.)
    datos_extra           JSON                     COMMENT 'Campos adicionales en formato JSON',

    -- Timestamp de recepción en el servidor (puede diferir del dispositivo)
    created_at            DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                   COMMENT 'Timestamp de recepción en el servidor',

    PRIMARY KEY (id),

    -- Índice principal: historial de un dispositivo ordenado por tiempo
    INDEX idx_device_tiempo (device_id, timestamp_dispositivo),

    -- Índice para consultas por rango de fechas sobre todos los dispositivos
    INDEX idx_tiempo        (timestamp_dispositivo),

    CONSTRAINT fk_telemetria_device
        FOREIGN KEY (device_id)
        REFERENCES  devices (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Mensajes MQTT recibidos de los dispositivos IoT';
