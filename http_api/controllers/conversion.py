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
Convert values from telemetry packets into engineering units.

"""

# --- See bottom of module for table of conversion functions by packet ID.

def _convert_TLMITEM_1_PL(values):
    """
    Convert State of Health telemetry into engineering units.

    """
    values["ACS_TAI_SECS"] = (values["ACS_TAI_SECS"] * .2)

    qecef_converted = [v * 1e-9 for v in values["ACS_QECEF_ECI"]]
    values["ACS_QECEF_ECI"] = (qecef_converted)

    orbit_pos_converted = [v * 2e-5 for v in values["ACS_ORBIT_POS_ECI"]]
    values["ACS_ORBIT_POS_ECI"] = (orbit_pos_converted)

    orbit_vel_converted = [v * 2e-9 for v in values["ACS_ORBIT_VEL_ECI"]]
    values["ACS_ORBIT_VEL_ECI"] = (orbit_vel_converted)

    att_quat_converted = [v * 5e-10 for v in values["ACS_ATT_QUAT"]]
    values["ACS_ATT_QUAT"] = (att_quat_converted)

    wheel_spd_converted = [v * .4 for v in values["ACS_WH_MS_SPEED"]]
    values["ACS_WH_MS_SPEED"] = (wheel_spd_converted)

    star_tr_converted = [v * 4.88e-10 for v in values["ACS_TR_ATT"]]
    values["ACS_TR_ATT"] = (star_tr_converted)

    sun_vector_converted = [v * 0.0001 for v in values["ACS_CSS_MSBV"]]
    values["ACS_CSS_MSBV"] = (sun_vector_converted)

    # Analog Telem for ACS
    values["ACS_AN_V5P0"] = (values["ACS_AN_V5P0"] * .025)
    values["ACS_AN_V3P3"] = (values["ACS_AN_V3P3"] * .015)
    values["ACS_AN_V2P5"] = (values["ACS_AN_V2P5"] * .015)
    values["ACS_AN_V1P8"] = (values["ACS_AN_V1P8"] * .015)
    values["ACS_AN_V1P0"] = (values["ACS_AN_V1P0"] * .015)
    values["ACS_AN_TDT"] = (values["ACS_AN_TDT"] * .8)
    values["ACS_AN_BOX1_TEMP"] = (values["ACS_AN_BOX1_TEMP"] * .005)
    values["ACS_AN_BOX2_TEMP"] = (values["ACS_AN_BOX2_TEMP"] * .005)
    values["ACS_AN_WHT1"] = (values["ACS_AN_WHT1"] * .005)
    values["ACS_AN_WHT2"] = (values["ACS_AN_WHT2"] * .005)
    values["ACS_AN_WHT3"] = (values["ACS_AN_WHT3"] * .005)
    values["ACS_AN_V12B"] = (values["ACS_AN_V12B"] * .001)

    # GPS
    ecef_gps_converted = [v * 2e-5 for v in values["ACS_GPS_POS_ECEF"]]
    values["ACS_GPS_POS_ECEF"] = (ecef_gps_converted)

    ecef_v_gps = [v * 5e-9 for v in values["ACS_GPS_VEL_ECEF"]]
    values["ACS_GPS_VEL_ECEF"] = (ecef_v_gps)

    # Tracker control
    trcl_conv = [v * 1e-9 for v in values["ACS_TRCL_QTWB"]]
    values["ACS_TRCL_QTWB"] = (trcl_conv)

    # Power
    # System Volts
    values["EPS_VPCM12V"] = (values["EPS_VPCM12V"] * .02 - 5.8)
    values["EPS_VPCM5V"] = (values["EPS_VPCM5V"] * .008 - 1.89)
    values["EPS_VPCM3V3"] = (values["EPS_VPCM3V3"] * .0059 - 1.23)
    values["EPS_VPCMBATV"] = (values["EPS_VPCMBATV"] * .0094 - .37)
    values["EPS_VIDIODE_OUT"] = (values["EPS_VIDIODE_OUT"] * .009 - .024)

    # Current
    values["EPS_IPCM12V"] = (values["EPS_IPCM12V"] * 2.063 - 1.95)
    values["EPS_IPCM5V"] = (values["EPS_IPCM5V"] * 5.289 - 36.448)
    values["EPS_IPCM3V3"] = (values["EPS_IPCM3V3"] * 5.288 - 14.770)
    values["EPS_IPCMBATV"] = (values["EPS_IPCMBATV"] * 5.284 - 19.076)
    values["EPS_IIDIODE_OUT"] = (values["EPS_IIDIODE_OUT"] * 14.201 - 7.87)

    # BCR Volts
    values["EPS_VBCR1"] = (values["EPS_VBCR1"] * .025 - .031)
    values["EPS_VBCR2"] = (values["EPS_VBCR2"] * .025 - .059)
    values["EPS_VBCR3"] = (values["EPS_VBCR3"] * .01 - .002)
    values["EPS_VBCR4"] = (values["EPS_VBCR4"] * .025 - .025)
    values["EPS_VBCR5"] = (values["EPS_VBCR5"] * .025 - .082)
    values["EPS_VBCR6"] = (values["EPS_VBCR6"] * .025 + .006)
    values["EPS_VBCR7"] = (values["EPS_VBCR7"] * .025 - .015)
    values["EPS_VBCR8"] = (values["EPS_VBCR8"] * .025 - .02)
    values["EPS_VBCR9"] = (values["EPS_VBCR9"] * .025 - .03)

    # Battery Volts/temps
    values["BAT_0_BAT_V"] = (values["BAT_0_BAT_V"] * -.011 + 10.165)
    values["BAT_1_BAT_V"] = (values["BAT_1_BAT_V"] * -.011 + 10.026)
    values["BAT_2_BAT_V"] = (values["BAT_2_BAT_V"] * -.011 + 10.184)
    values["BAT_0_TEMP"] = (values["BAT_0_TEMP"] * -.314 + 131.392)
    values["BAT_1_TEMP"] = (values["BAT_1_TEMP"] * -.303 + 130.212)
    values["BAT_2_TEMP"] = (values["BAT_2_TEMP"] * -.309 + 131.85)

    # Board Temps
    values["EPS_TBRD"] = (values["EPS_TBRD"] * .372 - 273.15)
    values["EPS_TBRD_DB"] = (values["EPS_TBRD_DB"] * .372 - 273.15)

    return values

def _convert_GPS_OD(values):
    """
    Convert GPS Orbit Data to engineering units.

    """
    return values

def _convert_BATTLM(values):
    """
    Convert Battery Telemetry to engineering units.

    """
    return values

def _convert_BIMTLM(values):
    """
    Convert Bus Interface Module Telemetry to engineering units.

    """
    return values

def _convert_PIMTLM(values):
    """
    Convert Payload Interface Module Telemetry to engineering units.

    """
    return values

# --- References conversion functions by Telemetry ID number
table = {
    113: _convert_TLMITEM_1_PL, # <-- The State of Health default packet
    87: _convert_GPS_OD,
    44: _convert_BATTLM,
    95: _convert_BIMTLM,
    98: _convert_PIMTLM
}
