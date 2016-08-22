test:
	nosetests -v

install:
	pip install -r requirements.txt
	cp -r http_api /opt/http_api
	chmod o+x /opt/http_api/http_api.sh
	ln http_api.service /etc/systemd/system/http_api.service
	systemctl enable http_api.service
	systemctl start http_api.service
	systemctl daemon-reload

uninstall:
	rm -r /opt/http_api
	systemctl stop http_api.service
	systemctl disable http_api.service
	systemctl daemon-reload
	rm /etc/systemd/system/http_api.service