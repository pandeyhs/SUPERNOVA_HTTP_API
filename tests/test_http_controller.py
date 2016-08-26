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
Run unit tests on http default_controller.

"""

import unittest
from .context import default_controller

class TestAPI(unittest.TestCase):
    """Test the HTTP endpoints."""

    def setUp(self):
        """Configure before testing."""
        pass

    def tearDown(self):
        """Tear down after testing."""
        pass

    def test_system(self):
        """TestHTTPController: Test the system endpoints."""
        default_controller.system_get()

    def test_adcs(self):
        """TestHTTPController: Test the ADCS endpoints."""
        default_controller.adcs_get()
        default_controller.adcs_state_get()
        default_controller.adcs_attitude_get()
        default_controller.adcs_coarse_sun_sensor_get()
        default_controller.adcs_propagator_attitude_get()
        default_controller.adcs_propagator_state_get()
        default_controller.adcs_star_tracker_get()
        default_controller.adcs_star_tracker_attitude_get()
        '''
        default_controller.adcs_attitude_post({
            'eci_qw': 0.333,
            'eci_qx': 0.333,
            'eci_qy': 0.333,
            'eci_qz': 0.333
            })
        default_controller.adcs_wheel_mode_post({
            'wheel': 'ALL',
            'mode': 'IDLE'
            })
        '''

    def test_eps(self):
        """TestHTTPController: Test the EPS endpoints."""
        default_controller.eps_get()
        default_controller.eps_bcr_get()
        default_controller.eps_current_get()
        default_controller.eps_voltage_get()

    def test_battery(self):
        """TestHTTPController: Test the Battery endpoints."""
        default_controller.battery_get()

    def test_gps(self):
        """TestHTTPController: Test the GSP endpoints."""
        default_controller.gps_get()
        default_controller.gps_state_get()

    def test_BIM(self):
        """TestHTTPController: Test the BIM endpoints."""
        default_controller.bim_get()

    def test_PIM(self):
        """TestHTTPController: Test the PIM endpoints."""
        default_controller.pim_get()

if __name__ == '__main__':
  unittest.main()
