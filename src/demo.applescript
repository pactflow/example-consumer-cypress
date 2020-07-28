tell application "System Events"
	delay 3

	set texttotype to "// set up Pact interactions
const expectedProduct = { id: '10', type: 'CREDIT_CARD', name: '28 Degrees' }"
	keystroke texttotype
	keystroke return

	delay 1

	set texttotype to "await mockProvider.addMockRoute({"
	keystroke texttotype
	keystroke return

	set texttotype to "      state: 'a product with ID 10 exists',"
	keystroke texttotype
	keystroke return
	set texttotype to "      uponReceiving: 'a request to get a product',"
	keystroke texttotype
	keystroke return
	set texttotype to "      withRequest: {"
	keystroke texttotype
	keystroke return
	set texttotype to "        method: 'GET',"
	keystroke texttotype
	keystroke return
	set texttotype to "        path: '/products/10',"
	keystroke texttotype
	keystroke return
	set texttotype to "        headers: {"
	keystroke texttotype
	keystroke return
	set texttotype to "          Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),"
	keystroke texttotype
	keystroke return
	set texttotype to "        },"
	keystroke texttotype
	keystroke return
	set texttotype to "      },"
	keystroke texttotype
	keystroke return
	set texttotype to "      willRespondWith: {"
	keystroke texttotype
	keystroke return
	set texttotype to "        status: 200,"
	keystroke texttotype
	keystroke return
	set texttotype to "        headers: {"
	keystroke texttotype
	keystroke return
	set texttotype to "          'Content-Type': 'application/json; charset=utf-8',"
	keystroke texttotype
	keystroke return
	set texttotype to "        },"
	keystroke texttotype
	keystroke return
	set texttotype to "        body: like(expectedProduct),"
	keystroke texttotype
	keystroke return
	set texttotype to "      },"
	keystroke texttotype
	keystroke return
	set texttotype to "    });"
	keystroke texttotype
	keystroke return

	keystroke texttotype
	keystroke return

end tell