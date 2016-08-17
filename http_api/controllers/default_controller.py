################################################################################
#(C) Copyright Pumpkin, Inc. All Rights Reserved.
#
#This file may be distributed under the terms of the License
#Agreement provided with this software.
#
#THIS FILE IS PROVIDED AS IS WITH NO WARRANTY OF ANY KIND,
#INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND
#FITNESS FOR A PARTICULAR PURPOSE.
################################################################################
"""
Handles HTTP requests.

"""

import logging, json, os, datetime
from multiprocessing import Lock

import supernova_apps as snova

# ------------------
# --- LOGGING CONFIG
LOG = logging.getLogger(__name__)

# -------------
# --- Bus State
SOH_FILE_PATH = os.path.join(os.path.dirname(__file__), 'SOH.json')
soh_lock = Lock()

# -------------
# --- Callbacks
def bus_telem_ack_recd(self, packet_obj, next_count):
    """
    Fired when request is recieved successfully by the Bus.

    """
    msg = 'Telemetry ACK recieved.'
    print(msg)
    LOG.info(msg)

def bus_telem_nack_recd(self, packet_obj, next_count, err_code):
    """
    Fired when Bus returns an error.

    """
    msg = 'Telemetry NACK recieved.'
    print(msg)
    LOG.info(msg)

def telemetry_recd(self, telemetry_obj):
    """
    Called when a telemetry packet is successfully received.

    Default behavior is `pass` because this is payload specific.

    """
    soh = _convert_soh(telemetry_obj)
    _write_soh(soh)

def command_ack_recd(self, packet_obj, next_count):
    """
    Fired when command is recieved successfully by the Bus.

    """
    msg = 'Command accepted.'
    print(msg)
    LOG.info(msg)

def command_nack_recd(self, packet_obj, next_count, err_code):
    """
    Fired when command results in error on Bus.

    """
    msg = 'Command rejected.'
    print(msg)
    LOG.info(msg)

# -------------------
# --- Service Manager
bus_interface = snova.SocketServiceManager()
# --- Register Callbacks
bus_interface.BusTelemPacket.ack_recd.register(bus_telem_ack_recd)
bus_interface.BusTelemPacket.nack_recd.register(bus_telem_nack_recd)
bus_interface.BusTelemPacket.telemetry_recd.register(telemetry_recd)
bus_interface.BusCommand.ack_recd.register(command_ack_recd)
bus_interface.BusCommand.nack_recd.register(command_nack_recd)
# --- Enable Packet
bus_interface.BusTelemPacket.reporting_enable()
print('bus_interface service manager configured')

# ---------------------
# --- Private Functions
def _convert_soh(telemetry_obj):
    """
    Converts State of Health telemetry into dictionary of engineering units.

    """
    telemetry_obj.values["ACS_TAI_SECS"] = (telemetry_obj.values["ACS_TAI_SECS"] * .2)

    qecef_converted = [v * 1e-9 for v in telemetry_obj.values["ACS_QECEF_ECI"]]
    telemetry_obj.values["ACS_QECEF_ECI"] = (qecef_converted)

    orbit_pos_converted = [v * 2e-5 for v in telemetry_obj.values["ACS_ORBIT_POS_ECI"]]
    telemetry_obj.values["ACS_ORBIT_POS_ECI"] = (orbit_pos_converted)

    orbit_vel_converted = [v * 2e-9 for v in telemetry_obj.values["ACS_ORBIT_VEL_ECI"]]
    telemetry_obj.values["ACS_ORBIT_VEL_ECI"] = (orbit_vel_converted)

    att_quat_converted = [v * 5e-10 for v in telemetry_obj.values["ACS_ATT_QUAT"]]
    telemetry_obj.values["ACS_ATT_QUAT"] = (att_quat_converted)

    wheel_spd_converted = [v * .4 for v in telemetry_obj.values["ACS_WH_MS_SPEED"]]
    telemetry_obj.values["ACS_WH_MS_SPEED"] = (wheel_spd_converted)

    star_tr_converted = [v * 4.88e-10 for v in telemetry_obj.values["ACS_TR_ATT"]]
    telemetry_obj.values["ACS_TR_ATT"] = (star_tr_converted)

    sun_vector_converted = [v * 0.0001 for v in telemetry_obj.values["ACS_CSS_MSBV"]]
    telemetry_obj.values["ACS_CSS_MSBV"] = (sun_vector_converted)

    # Analog Telem for ACS
    telemetry_obj.values["ACS_AN_V5P0"] = (telemetry_obj.values["ACS_AN_V5P0"] * .025)
    telemetry_obj.values["ACS_AN_V3P3"] = (telemetry_obj.values["ACS_AN_V3P3"] * .015)
    telemetry_obj.values["ACS_AN_V2P5"] = (telemetry_obj.values["ACS_AN_V2P5"] * .015)
    telemetry_obj.values["ACS_AN_V1P8"] = (telemetry_obj.values["ACS_AN_V1P8"] * .015)
    telemetry_obj.values["ACS_AN_V1P0"] = (telemetry_obj.values["ACS_AN_V1P0"] * .015)
    telemetry_obj.values["ACS_AN_TDT"] = (telemetry_obj.values["ACS_AN_TDT"] * .8)
    telemetry_obj.values["ACS_AN_BOX1_TEMP"] = (telemetry_obj.values["ACS_AN_BOX1_TEMP"] * .005)
    telemetry_obj.values["ACS_AN_BOX2_TEMP"] = (telemetry_obj.values["ACS_AN_BOX2_TEMP"] * .005)
    telemetry_obj.values["ACS_AN_WHT1"] = (telemetry_obj.values["ACS_AN_WHT1"] * .005)
    telemetry_obj.values["ACS_AN_WHT2"] = (telemetry_obj.values["ACS_AN_WHT2"] * .005)
    telemetry_obj.values["ACS_AN_WHT3"] = (telemetry_obj.values["ACS_AN_WHT3"] * .005)
    telemetry_obj.values["ACS_AN_V12B"] = (telemetry_obj.values["ACS_AN_V12B"] * .001)

    # GPS
    ecef_gps_converted = [v * 2e-5 for v in telemetry_obj.values["ACS_GPS_POS_ECEF"]]
    telemetry_obj.values["ACS_GPS_POS_ECEF"] = (ecef_gps_converted)

    ecef_v_gps = [v * 5e-9 for v in telemetry_obj.values["ACS_GPS_VEL_ECEF"]]
    telemetry_obj.values["ACS_GPS_VEL_ECEF"] = (ecef_v_gps)

    # Tracker control
    trcl_conv = [v * 1e-9 for v in telemetry_obj.values["ACS_TRCL_QTWB"]]
    telemetry_obj.values["ACS_TRCL_QTWB"] = (trcl_conv)

    # Power
    # System Volts
    telemetry_obj.values["EPS_VPCM12V"] = (telemetry_obj.values["EPS_VPCM12V"] * .02 - 5.8)
    telemetry_obj.values["EPS_VPCM5V"] = (telemetry_obj.values["EPS_VPCM5V"] * .008 - 1.89)
    telemetry_obj.values["EPS_VPCM3V3"] = (telemetry_obj.values["EPS_VPCM3V3"] * .0059 - 1.23)
    telemetry_obj.values["EPS_VPCMBATV"] = (telemetry_obj.values["EPS_VPCMBATV"] * .0094 - .37)
    telemetry_obj.values["EPS_VIDIODE_OUT"] = (telemetry_obj.values["EPS_VIDIODE_OUT"] * .009 - .024)

    # Current
    telemetry_obj.values["EPS_IPCM12V"] = (telemetry_obj.values["EPS_IPCM12V"] * 2.063 - 1.95)
    telemetry_obj.values["EPS_IPCM5V"] = (telemetry_obj.values["EPS_IPCM5V"] * 5.289 - 36.448)
    telemetry_obj.values["EPS_IPCM3V3"] = (telemetry_obj.values["EPS_IPCM3V3"] * 5.288 - 14.770)
    telemetry_obj.values["EPS_IPCMBATV"] = (telemetry_obj.values["EPS_IPCMBATV"] * 5.284 - 19.076)
    telemetry_obj.values["EPS_IIDIODE_OUT"] = (telemetry_obj.values["EPS_IIDIODE_OUT"] * 14.201 - 7.87)

    # BCR Volts
    telemetry_obj.values["EPS_VBCR1"] = (telemetry_obj.values["EPS_VBCR1"] * .025 - .031)
    telemetry_obj.values["EPS_VBCR2"] = (telemetry_obj.values["EPS_VBCR2"] * .025 - .059)
    telemetry_obj.values["EPS_VBCR3"] = (telemetry_obj.values["EPS_VBCR3"] * .01 - .002)
    telemetry_obj.values["EPS_VBCR4"] = (telemetry_obj.values["EPS_VBCR4"] * .025 - .025)
    telemetry_obj.values["EPS_VBCR5"] = (telemetry_obj.values["EPS_VBCR5"] * .025 - .082)
    telemetry_obj.values["EPS_VBCR6"] = (telemetry_obj.values["EPS_VBCR6"] * .025 + .006)
    telemetry_obj.values["EPS_VBCR7"] = (telemetry_obj.values["EPS_VBCR7"] * .025 - .015)
    telemetry_obj.values["EPS_VBCR8"] = (telemetry_obj.values["EPS_VBCR8"] * .025 - .02)
    telemetry_obj.values["EPS_VBCR9"] = (telemetry_obj.values["EPS_VBCR9"] * .025 - .03)

    # Battery Volts/temps
    telemetry_obj.values["BAT_0_BAT_V"] = (telemetry_obj.values["BAT_0_BAT_V"] * -.011 + 10.165)
    telemetry_obj.values["BAT_1_BAT_V"] = (telemetry_obj.values["BAT_1_BAT_V"] * -.011 + 10.026)
    telemetry_obj.values["BAT_2_BAT_V"] = (telemetry_obj.values["BAT_2_BAT_V"] * -.011 + 10.184)
    telemetry_obj.values["BAT_0_TEMP"] = (telemetry_obj.values["BAT_0_TEMP"] * -.314 + 131.392)
    telemetry_obj.values["BAT_1_TEMP"] = (telemetry_obj.values["BAT_1_TEMP"] * -.303 + 130.212)
    telemetry_obj.values["BAT_2_TEMP"] = (telemetry_obj.values["BAT_2_TEMP"] * -.309 + 131.85)

    # Board Temps
    telemetry_obj.values["EPS_TBRD"] = (telemetry_obj.values["EPS_TBRD"] * .372 - 273.15)
    telemetry_obj.values["EPS_TBRD_DB"] = (telemetry_obj.values["EPS_TBRD_DB"] * .372 - 273.15)

    return telemetry_obj.values

def _write_soh(soh):
    """
    Writes state of health to file.
    """
    soh_lock.acquire()
    with open(SOH_FILE_PATH, 'w+') as f:
        json.dump(soh, f, ensure_ascii=False)
    soh_lock.release()

def _read_soh():
    """
    Reads state of health from file & converts to Py object.

    """
    soh_lock.acquire()
    with open(SOH_FILE_PATH, 'r') as f:
        soh = json.load(f)
    soh_lock.release()
    return soh

############################
### API Controllers
############################

# -------
# --- GET
# -------

# --- System
def system_get():
    soh = _read_soh()
    system = {
        'fault_count': soh['SOH_CDH_FAULT_COUNT'],
        'temperature': soh['BD_cpu_temp'],
        'time': datetime.datetime.now().isoformat()
    }
    return system

# --- ADCS
def adcs_get():
    soh = _read_soh()
    status_text = ['SUN_POINT', 'FINE_REF_POINT']
    adcs = {
        'fault_count': soh['ACS_FAULT_COUNT'],
        'temperature': soh['ACS_AN_BOX1_TEMP'],
        'adcs_mode':{
            'id': soh['ACS_ADCS_MODE'],
            'text': status_text[soh['ACS_ADCS_MODE']]
        }
    }
    return adcs

def adcs_state_get():
    soh = _read_soh()
    adcs_state = {
        'eci_x_km': soh['ACS_ORBIT_POS_ECI'][0],
        'eci_y_km': soh['ACS_ORBIT_POS_ECI'][1],
        'eci_z_km': soh['ACS_ORBIT_POS_ECI'][2],
        'eci_dx_kms': soh['ACS_ORBIT_VEL_ECI'][0],
        'eci_dy_kms': soh['ACS_ORBIT_VEL_ECI'][1],
        'eci_dz_kms': soh['ACS_ORBIT_VEL_ECI'][2],
        'time': soh['ACS_TAI_SECS']
    }
    return adcs_state

def adcs_attitude_get():
    soh = _read_soh()
    adcs_attitude = {
        'eci_qw': soh['ACS_ATT_QUAT'][0],
        'eci_qx': soh['ACS_ATT_QUAT'][1],
        'eci_qy': soh['ACS_ATT_QUAT'][2],
        'eci_qz': soh['ACS_ATT_QUAT'][3]
    }
    return adcs_attitude

def adcs_coarse_sun_sensor_get():
    soh = _read_soh()
    status_text = ['GOOD', 'COARSE', 'BAD']
    adcs_coarse_sun_sensor = {
        'status': {
            'id': soh['ACS_CSS_MSBVS'],
            'text': status_text[soh['ACS_CSS_MSBVS']]
        },
        'sun_body_vector_1': soh['ACS_CSS_MSBV'][0],
        'sun_body_vector_2': soh['ACS_CSS_MSBV'][1],
        'sun_body_vector_3': soh['ACS_CSS_MSBV'][2]
    }
    return adcs_coarse_sun_sensor

def adcs_gps_get():
    soh = _read_soh()
    adcs_gps = {
        'enabled': soh['ACS_GPS_ENABLE'],
        'valid': soh['ACS_GPS_VALID']
    }
    return adcs_gps

def adcs_gps_state_get():
    soh = _read_soh()
    adcs_gps_state = {
        'eci_x_km': soh['ACS_GPS_POS_ECEF'][0],
        'eci_y_km': soh['ACS_GPS_POS_ECEF'][1],
        'eci_z_km': soh['ACS_GPS_POS_ECEF'][2],
        'eci_dx_kms': soh['ACS_GPS_VEL_ECEF'][0],
        'eci_dy_kms': soh['ACS_GPS_VEL_ECEF'][1],
        'eci_dz_kms': soh['ACS_GPS_VEL_ECEF'][2],
        'time': soh['ACS_TAI_SECS']
    }
    return adcs_gps_state

def adcs_propagator_attitude_get():
    soh = _read_soh()
    adcs_propagator_attitude = {
        'eci_qw': soh['ACS_ATT_QUAT'][0],
        'eci_qx': soh['ACS_ATT_QUAT'][1],
        'eci_qy': soh['ACS_ATT_QUAT'][2],
        'eci_qz': soh['ACS_ATT_QUAT'][3]
    }
    return adcs_propagator_attitude

def adcs_propagator_state_get():
    soh = _read_soh()
    adcs_propagator_state = {
        'eci_x_km': soh['ACS_ORBIT_POS_ECI'][0],
        'eci_y_km': soh['ACS_ORBIT_POS_ECI'][1],
        'eci_z_km': soh['ACS_ORBIT_POS_ECI'][2],
        'eci_dx_kms': soh['ACS_ORBIT_VEL_ECI'][0],
        'eci_dy_kms': soh['ACS_ORBIT_VEL_ECI'][1],
        'eci_dz_kms': soh['ACS_ORBIT_VEL_ECI'][2],
        'time': soh['ACS_TAI_SECS']
    }
    return adcs_propagator_state

def adcs_star_tracker_get():
    soh = _read_soh()
    status_text_attitude = ['OK', 'BAD', 'TOO_FEW_STARS', 'REQUEST_FAILED',
        'RESIDUALS_TOO_HIGH']
    status_text_attitude_rate = ['OK', 'BAD']
    adcs_star_tracker = {
        'tracker_attitude_status': {
            'id': soh['ACS_TR_ATT_STAT'],
            'text': status_text_attitude[soh['ACS_TR_ATT_STAT']]
        },
        'tracker_rate_attitude_status': {
            'id': soh['ACS_TR_RT_EST_STAT'],
            'text': status_text_attitude_rate[soh['ACS_TR_RT_EST_STAT']]
        }
    }
    return adcs_star_tracker

def adcs_star_tracker_attitude_get():
    soh = _read_soh()
    adcs_star_tracker_attitude = {
        'eci_qw': soh['ACS_TR_ATT'][0],
        'eci_qx': soh['ACS_TR_ATT'][1],
        'eci_qy': soh['ACS_TR_ATT'][2],
        'eci_qz': soh['ACS_TR_ATT'][3]
    }
    return adcs_star_tracker_attitude

# --- EPS
def eps_get():
    soh = _read_soh()
    eps = {
        'epsTemperatures': [
            soh['EPS_TBRD'],
            soh['EPS_TBRD_DB']
        ],
        'faults': {
            'battery': soh['SOH_BAT_FAULT_COUNT'],
            'eps': soh['SOH_EPS_FAULT_COUNT']
        }
    }
    return eps

def eps_battery_get():
    soh = _read_soh()
    eps_battery = {
        'temperature': [
            soh['BAT_0_BAT_V'],
            soh['BAT_1_BAT_V'],
            soh['BAT_2_BAT_V']
        ],
        'voltage': [
            soh['BAT_0_TEMP'],
            soh['BAT_1_TEMP'],
            soh['BAT_2_TEMP']
        ]
    }
    return eps_battery

def eps_bcr_get():
    soh = _read_soh()
    eps_bcr = {
        'input': [
            soh['EPS_VBCR1'],
            soh['EPS_VBCR2'],
            soh['EPS_VBCR3'],
            soh['EPS_VBCR4'],
            soh['EPS_VBCR5'],
            soh['EPS_VBCR6'],
            soh['EPS_VBCR7'],
            soh['EPS_VBCR8'],
            soh['EPS_VBCR9']
        ],
        'output': {
            'current': soh['EPS_IIDIODE_OUT'],
            'voltage': soh['EPS_VIDIODE_OUT']
        }
    }
    return eps_bcr

def eps_current_get():
    soh = _read_soh()
    eps_current = {
        '12V': soh['EPS_IPCM12V'],
        '3V3': soh['EPS_IPCM3V3'],
        '5V': soh['EPS_IPCM5V'],
        'battery': soh['EPS_IPCMBATV']
    }
    return eps_current

def eps_voltage_get():
    soh = _read_soh()
    eps_voltage = {
        '12V': soh['EPS_VPCM12V'],
        '3V3': soh['EPS_VPCM3V3'],
        '5V': soh['EPS_VPCM5V'],
        'battery': soh['EPS_VPCMBATV']
    }
    return eps_voltage


# --------
# --- POST
# --------
def system_reset_post(reset_type):
    reset_types = ['SYS_REBOOT', 'WDOG', 'ALL_HW_OFF']
    try:
        reset_arguments = {
            'RESET_TYPE': reset_types.index(reset_type)
        }
    except:
        return 'Invalid Input', 405
    else:
        command_obj = snova.Command(
            cmd_pkt_name='SW_RESET',
            arguments=reset_arguments
        )
        bus_interface.BusCommand.send_command(command_obj)
        return 'Success', 200

def adcs_wheel_mode_post(wheel_mode):
    # !!! This assumes BCT ADCS
    wheels = ['ALL', '1', '2', '3', '4']
    mode_types = ['IDLE', 'INTERNAL', 'EXTERNAL']
    try:
        wheel_mode_arguments = {
            'ARC_APID': 7,
            'ARC_OPCODE': 2,
            'ARC_WHEEL': wheels.index(wheel_mode['wheel']),
            'ARC_WHEEL_MODE': mode_types.index(wheel_mode['mode'])
        }
    except:
        return 'Invalid Input', 405
    else:
        command_obj = snova.Command(
            cmd_pkt_name='ACS_RAW_SETWHEELMODE',
            arguments=wheel_mode_arguments
        )
        bus_interface.BusCommand.send_command(command_obj)
        return 'Command Sent', 200

def adcs_attitude_post(attitude):
    # !!! This assumes BCT ADCS
    try:
        attitude_arguments = {
            'ARC_APID': 5,
            'ARC_OPCODE': 2,
            'ARC_Q_B_WRT_I_1': attitude['eci_qw'],
            'ARC_Q_B_WRT_I_2': attitude['eci_qx'],
            'ARC_Q_B_WRT_I_3': attitude['eci_qy'],
            'ARC_Q_B_WRT_I_4': attitude['eci_qz']
        }
    except:
        return 'Invalid Input', 405
    else:
        command_obj = snova.Command(
            cmd_pkt_name='ACS_RAW_SETATTITUDE',
            arguments=attitude_arguments
        )
        bus_interface.BusCommand.send_command(command_obj)
        return 'Command Sent', 200
