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
Handle HTTP requests.

"""

import logging, json, os, datetime, time, threading, Queue
from multiprocessing import Lock

import supernova_apps as snova

import conversion

# ------------------
# --- LOGGING CONFIG
LOG = logging.getLogger(__name__)

# -------------
# --- Bus State
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), 'DATA.json')
data_file_lock = Lock()

# ------------------------
# --- Command Post objects

# --- Prevents command from posting before previous command post finished
CMD_POST_LOCK = threading.Lock()
# --- Stores responses from command 
CMD_POST_RESPONSES = Queue.Queue()

# -------------
# --- Callbacks
def bus_telem_ack_recd(self, packet_obj, next_count):
    """
    Fired when request is recieved successfully by the Bus.

    """
    msg = 'Telemetry ACK recieved.'
    print(msg)
    LOG.debug(msg)

def bus_telem_nack_recd(self, packet_obj, next_count, err_code):
    """
    Fired when Bus returns an error.

    """
    msg = 'Telemetry NACK recieved.'
    print(msg)
    LOG.debug(msg)

def telemetry_recd(self, telemetry_obj):
    """
    Called when a telemetry packet is successfully received.

    Default behavior is `pass` because this is payload specific.

    """
    # --- Check packet ID & convert values to engineering units accordingly
    conversion_function = conversion.table[telemetry_obj.packet_id]
    values = conversion_function(telemetry_obj.values)
    # --- Read data file
    data = _read_data()
    # --- Update data values & write to file
    for key in values:
        data[telemetry_obj.name][key] = values[key]
    _write_data(data)
    # NOTE: We are reading and overwriting the whole data JSON file here.
    #   At some point it might make more sense to use a document store like 
    #   MongoDB instead of a JSON file.

    msg = 'Telemetry packet [{}] received.'.format(telemetry_obj.name)
    print(msg)
    LOG.debug(msg)

def command_ack_recd(self, packet_obj, next_count):
    """
    Fired when command is recieved successfully by the Bus.

    """
    CMD_POST_RESPONSES.put(('Success', 200))
    msg = 'Command accepted by Core FSW.'
    print(msg)
    LOG.info(msg)

def command_nack_recd(self, packet_obj, next_count, err_code):
    """
    Fired when command results in error on Bus.

    """
    CMD_POST_RESPONSES.put(('Bad Request', 400))
    # TODO: eventually handle other HTTP error codes based on Core err_code
    msg = 'Command rejected by Core FSW.'
    print(msg)
    LOG.debug(msg)

# -------------------
# --- Service Manager
bus_interface = snova.SocketServiceManager()
# --- Register Callbacks
bus_interface.BusTelemPacket.ack_recd.register(bus_telem_ack_recd)
bus_interface.BusTelemPacket.nack_recd.register(bus_telem_nack_recd)
bus_interface.BusTelemPacket.telemetry_recd.register(telemetry_recd)
bus_interface.BusCommand.ack_recd.register(command_ack_recd)
bus_interface.BusCommand.nack_recd.register(command_nack_recd)
# --- Request Packets (default 1Hz, continuous)
bus_interface.BusTelemPacket.request(113) # --- State of Health default Telemetry
bus_interface.BusTelemPacket.request(87) # --- GPS Oribit Data Telemetry
bus_interface.BusTelemPacket.request(44) # --- Battery Telemetry
bus_interface.BusTelemPacket.request(95) # --- BIM Telemetry
bus_interface.BusTelemPacket.request(98) # --- PIM Telemetry
# --- Enable Packets
bus_interface.BusTelemPacket.reporting_enable()
print('bus_interface service manager configured')

# ---------------------
# --- Private Functions
def _write_data(data):
    """
    Writes state of health to file.
    """
    data_file_lock.acquire()
    with open(DATA_FILE_PATH, 'w+') as f:
        json.dump(data, f, ensure_ascii=False)
    data_file_lock.release()

def _read_data():
    """
    Reads state of health from file & converts to Py object.

    """
    data_file_lock.acquire()
    with open(DATA_FILE_PATH, 'r') as f:
        data = json.load(f)
    data_file_lock.release()
    return data

def _command_post(cmd_pkt_name, arguments):
    """
    Handle sending a command to Core FSW.

    Args:
        cmd_pkt_name (string): Name of the command to POST
        arguments (dict): arguments to the command

    """
    CMD_POST_LOCK.acquire()
    # --- Create command object
    command_obj = snova.Command(
        cmd_pkt_name=cmd_pkt_name,
        arguments=arguments
    )
    # --- Send command object
    bus_interface.BusCommand.send_command(command_obj)
    # --- Wait for response for `timeout` seconds
    try:
        response = CMD_POST_RESPONSES.get(timeout=5)
    except Queue.Empty:
        response = 'Request Timeout', 408
    CMD_POST_LOCK.release()
    return response

############################
### API Controllers
############################

# -------
# --- GET
# -------

# --- System
def system_get():
    data = _read_data()
    system = {
        'fault_count': data['TLMITEM_1_PL']['SOH_CDH_FAULT_COUNT'],
        'temperature': data['TLMITEM_1_PL']['BD_cpu_temp'],
        'time': datetime.datetime.now().isoformat()
    }
    return system

# --- BIM
def bim_get():
    data = _read_data()
    bim = {
        'error_count': data['BIMTLM']['BIM_ERROR_COUNT'],
        'command_count': data['BIMTLM']['BIM_COMMAND_COUNT'],
        'uart1_status': data['BIMTLM']['BIM_UART_STATUS_1'],
        'uart2_status': data['BIMTLM']['BIM_UART_STATUS_2'],
        'uart3_status': data['BIMTLM']['BIM_UART_STATUS_3'],
        'pin_puller_status': data['BIMTLM']['BIM_TINI_STATUS']
    }
    return bim

# --- PIM
def pim_get():
    data = _read_data()
    pim = {
        'error_count': data['PIMTLM']['BIM_ERROR_COUNT'],
        'command_count': data['PIMTLM']['BIM_COMMAND_COUNT'],
        'payload_port1_status': data['PIMTLM']['PIM_PORT_STATUS_1'],
        'payload_port2_status': data['PIMTLM']['PIM_PORT_STATUS_2'],
        'payload_port3_status': data['PIMTLM']['PIM_PORT_STATUS_3'],
        'payload_port4_status': data['PIMTLM']['PIM_PORT_STATUS_4']
    }
    return pim

# --- ADCS
def adcs_get():
    data = _read_data()
    mode_text = ['SUN_POINT', 'FINE_REF_POINT']
    adcs = {
        'fault_count': data['TLMITEM_1_PL']['ACS_FAULT_COUNT'],
        'accept_count': data['TLMITEM_1_PL']['ACS_CMD_ACCEPT_CNT'],
        'temperature': data['TLMITEM_1_PL']['ACS_AN_BOX1_TEMP'],
        'adcs_mode':{
            'id': data['TLMITEM_1_PL']['ACS_ADCS_MODE'],
            'text': mode_text[data['TLMITEM_1_PL']['ACS_ADCS_MODE']]
        }
    }
    return adcs

def adcs_state_get():
    data = _read_data()
    adcs_state = {
        'eci_x_km': data['TLMITEM_1_PL']['ACS_ORBIT_POS_ECI'][0],
        'eci_y_km': data['TLMITEM_1_PL']['ACS_ORBIT_POS_ECI'][1],
        'eci_z_km': data['TLMITEM_1_PL']['ACS_ORBIT_POS_ECI'][2],
        'eci_dx_kms': data['TLMITEM_1_PL']['ACS_ORBIT_VEL_ECI'][0],
        'eci_dy_kms': data['TLMITEM_1_PL']['ACS_ORBIT_VEL_ECI'][1],
        'eci_dz_kms': data['TLMITEM_1_PL']['ACS_ORBIT_VEL_ECI'][2],
        'time': data['TLMITEM_1_PL']['ACS_TAI_SECS']
    }
    return adcs_state

def adcs_attitude_get():
    data = _read_data()
    adcs_attitude = {
        'eci_qw': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][0],
        'eci_qx': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][1],
        'eci_qy': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][2],
        'eci_qz': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][3]
    }
    return adcs_attitude

def adcs_coarse_sun_sensor_get():
    data = _read_data()
    status_text = ['GOOD', 'COARSE', 'BAD']
    adcs_coarse_sun_sensor = {
        'status': {
            'id': data['TLMITEM_1_PL']['ACS_CSS_MSBVS'],
            'text': status_text[data['TLMITEM_1_PL']['ACS_CSS_MSBVS']]
        },
        'sun_body_vector_1': data['TLMITEM_1_PL']['ACS_CSS_MSBV'][0],
        'sun_body_vector_2': data['TLMITEM_1_PL']['ACS_CSS_MSBV'][1],
        'sun_body_vector_3': data['TLMITEM_1_PL']['ACS_CSS_MSBV'][2]
    }
    return adcs_coarse_sun_sensor

def adcs_propagator_attitude_get():
    data = _read_data()
    adcs_propagator_attitude = {
        'eci_qw': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][0],
        'eci_qx': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][1],
        'eci_qy': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][2],
        'eci_qz': data['TLMITEM_1_PL']['ACS_ATT_QUAT'][3]
    }
    return adcs_propagator_attitude

def adcs_propagator_state_get():
    data = _read_data()
    adcs_propagator_state = {
        'eci_x_km': data['TLMITEM_1_PL']['ACS_ORBIT_POS_ECI'][0],
        'eci_y_km': data['TLMITEM_1_PL']['ACS_ORBIT_POS_ECI'][1],
        'eci_z_km': data['TLMITEM_1_PL']['ACS_ORBIT_POS_ECI'][2],
        'eci_dx_kms': data['TLMITEM_1_PL']['ACS_ORBIT_VEL_ECI'][0],
        'eci_dy_kms': data['TLMITEM_1_PL']['ACS_ORBIT_VEL_ECI'][1],
        'eci_dz_kms': data['TLMITEM_1_PL']['ACS_ORBIT_VEL_ECI'][2],
        'time': data['TLMITEM_1_PL']['ACS_TAI_SECS']
    }
    return adcs_propagator_state

def adcs_star_tracker_get():
    data = _read_data()
    status_text = ['OK', 'BAD', 'TOO_FEW_STARS', 'REQUEST_FAILED',
        'RESIDUALS_TOO_HIGH']
    rate_status_text = ['OK', 'BAD']
    adcs_star_tracker = {
        'tracker_attitude_status': {
            'id': data['TLMITEM_1_PL']['ACS_TR_ATT_STAT'],
            'text': status_text[data['TLMITEM_1_PL']['ACS_TR_ATT_STAT']]
        },
        'tracker_rate_attitude_status': {
            'id': data['TLMITEM_1_PL']['ACS_TR_RT_EST_STAT'],
            'text': rate_status_text[data['TLMITEM_1_PL']['ACS_TR_RT_EST_STAT']]
        }
    }
    return adcs_star_tracker

def adcs_star_tracker_attitude_get():
    data = _read_data()
    adcs_star_tracker_attitude = {
        'eci_qw': data['TLMITEM_1_PL']['ACS_TR_ATT'][0],
        'eci_qx': data['TLMITEM_1_PL']['ACS_TR_ATT'][1],
        'eci_qy': data['TLMITEM_1_PL']['ACS_TR_ATT'][2],
        'eci_qz': data['TLMITEM_1_PL']['ACS_TR_ATT'][3]
    }
    return adcs_star_tracker_attitude

# --- GPS
def gps_get():
    data = _read_data()
    adcs_gps = {
        'enabled': data['TLMITEM_1_PL']['ACS_GPS_ENABLE'],
        'valid': data['TLMITEM_1_PL']['ACS_GPS_VALID']
    }
    return adcs_gps

def gps_state_get():
    data = _read_data()
    adcs_gps_state = {
        'eci_x_km': data['TLMITEM_1_PL']['ACS_GPS_POS_ECEF'][0],
        'eci_y_km': data['TLMITEM_1_PL']['ACS_GPS_POS_ECEF'][1],
        'eci_z_km': data['TLMITEM_1_PL']['ACS_GPS_POS_ECEF'][2],
        'eci_dx_kms': data['TLMITEM_1_PL']['ACS_GPS_VEL_ECEF'][0],
        'eci_dy_kms': data['TLMITEM_1_PL']['ACS_GPS_VEL_ECEF'][1],
        'eci_dz_kms': data['TLMITEM_1_PL']['ACS_GPS_VEL_ECEF'][2],
        'time': data['TLMITEM_1_PL']['ACS_TAI_SECS']
    }
    return adcs_gps_state

# --- EPS
def eps_get():
    data = _read_data()
    eps = {
        'epsTemperatures': [
            data['TLMITEM_1_PL']['EPS_TBRD'],
            data['TLMITEM_1_PL']['EPS_TBRD_DB']
        ],
        'faults': {
            'battery': data['TLMITEM_1_PL']['SOH_BAT_FAULT_COUNT'],
            'eps': data['TLMITEM_1_PL']['SOH_EPS_FAULT_COUNT']
        }
    }
    return eps

def eps_bcr_get():
    data = _read_data()
    eps_bcr = {
        'input': [
            data['TLMITEM_1_PL']['EPS_VBCR1'],
            data['TLMITEM_1_PL']['EPS_VBCR2'],
            data['TLMITEM_1_PL']['EPS_VBCR3'],
            data['TLMITEM_1_PL']['EPS_VBCR4'],
            data['TLMITEM_1_PL']['EPS_VBCR5'],
            data['TLMITEM_1_PL']['EPS_VBCR6'],
            data['TLMITEM_1_PL']['EPS_VBCR7'],
            data['TLMITEM_1_PL']['EPS_VBCR8'],
            data['TLMITEM_1_PL']['EPS_VBCR9']
        ],
        'output': {
            'current': data['TLMITEM_1_PL']['EPS_IIDIODE_OUT'],
            'voltage': data['TLMITEM_1_PL']['EPS_VIDIODE_OUT']
        }
    }
    return eps_bcr

def eps_current_get():
    data = _read_data()
    eps_current = {
        '12V': data['TLMITEM_1_PL']['EPS_IPCM12V'],
        '3V3': data['TLMITEM_1_PL']['EPS_IPCM3V3'],
        '5V': data['TLMITEM_1_PL']['EPS_IPCM5V'],
        'battery': data['TLMITEM_1_PL']['EPS_IPCMBATV']
    }
    return eps_current

def eps_voltage_get():
    data = _read_data()
    eps_voltage = {
        '12V': data['TLMITEM_1_PL']['EPS_VPCM12V'],
        '3V3': data['TLMITEM_1_PL']['EPS_VPCM3V3'],
        '5V': data['TLMITEM_1_PL']['EPS_VPCM5V'],
        'battery': data['TLMITEM_1_PL']['EPS_VPCMBATV']
    }
    return eps_voltage

# --- Battery
def battery_get():
    data = _read_data()
    eps_battery = {
        'temperature': [
            data['TLMITEM_1_PL']['BAT_0_TEMP'],
            data['TLMITEM_1_PL']['BAT_1_TEMP'],
            data['TLMITEM_1_PL']['BAT_2_TEMP']
        ],
        'voltage': [
            data['TLMITEM_1_PL']['BAT_0_BAT_V'],
            data['TLMITEM_1_PL']['BAT_1_BAT_V'],
            data['TLMITEM_1_PL']['BAT_2_BAT_V']
        ]
    }
    return eps_battery

# --------
# --- POST
# --------
def system_noop_post():
    CMD_POST_RESPONSES.put(('Success', 200))
    noop_args = {}
    return _command_post('NOOP', noop_args)

def system_reset_post(reset_type):
    reset_types = ['SYS_REBOOT', 'WDOG', 'ALL_HW_OFF']
    try:
        reset_args = {
            'RESET_TYPE': reset_types.index(reset_type)
        }
    except:
        return 'Invalid Input', 400
    else:
        return _command_post('SW_RESET', reset_args)

# TODO - find out how to send SCPI commands.
'''
def bim_post():
    pass

def pim_post():
    pass
'''

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
        return 'Invalid Input', 400
    else:
        return _command_post('ACS_RAW_SETWHEELMODE', wheel_mode_arguments)

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
        return 'Invalid Input', 400
    else:
        return _command_post('ACS_RAW_SETATTITUDE', attitude_arguments)
