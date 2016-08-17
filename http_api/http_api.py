#!/usr/bin/env python

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
HTTP Server for communicating with the SUPERNOVA Bus.

Uses Connexion to configure server from swagger.io file.

"""
import logging, datetime, os, sys

import connexion
from flask_cors import CORS

from controllers.default_controller import bus_interface

# ------------------
# --- LOGGING CONFIG
logpath = os.path.join(os.path.dirname(__file__), 'logs')
# --- Use startup timestamp for log name
logfile = os.path.join(logpath, datetime.datetime.now().isoformat() + '.log')
# --- Set logger name to this module's name
LOG = logging.getLogger(__name__)

# ----------------
# --- CMDLINE ARGS
for arg in sys.argv[1:]:
    if arg == 'log':
        try:
        # --- Create logs directory if doesn't exist
            os.mkdir(logpath)
        except OSError:
        # --- Directory exists
            pass
        # --- Enable logger
        logging.basicConfig(filename=logfile, level=logging.DEBUG)
        # --- Level options: [DEBUG, INFO, WARNING, ERROR, CRITICAL]
        # !-- Notice: Setting level=logging.DEBUG will lead to a LOT of data

# ---------------
# --- SERVER MAIN
if __name__ == '__main__':
    """
    Start the HTTP ReST API Server on 0.0.0.0:9000

    """
    http_server = connexion.App(__name__, specification_dir='./swagger')
    http_server.add_api('swagger.yaml')
    # --- Uses flask_cors to allow cross-origin requests
    CORS(http_server.app)
    bus_interface.run()
    http_server.run(server='tornado', port=9000)
