import { Notification, VSBrowser, WebDriver, EditorView } from 'vscode-extension-tester';
import { expect } from 'chai';
import { getNotificationWithMessage, whilegetNotificationWithMessage, atlasMapWindowExists } from './common/conditions';
import { notifications, views } from './common/constants';
import { startAtlasMap, stopAtlasMap, atlasMapTabIsAccessible, clearNotifications } from './common/utils';


export function basicTests() {
	let driver: WebDriver;

	describe('Start/Stop AtlasMap and verify correct notifications', () => {
		beforeEach(async function () {
			driver = VSBrowser.instance.driver;
			await clearNotifications();
		});

		after(async function () {
			await clearNotifications();
		});

		it('Start Command should show a notification with the correct text', async function () {
			this.timeout(40000);
			await startAtlasMap(30000);
			await driver.wait(() => getNotificationWithMessage(notifications.ATLASMAP_STARTING), 30000).catch(expect.fail);
			await stopAtlasMap(30000);
		});

		it('Second Start Command should open AtlasMap window', async function () {
			this.timeout(40000);
			await startAtlasMap(30000);
			await driver.wait(() => atlasMapWindowExists(), 30000, 'Atlas map editor does not exist');
			await atlasMapTabIsAccessible();
			new EditorView().closeEditor(views.ATLASMAP_TITLE).catch(expect.fail);
		});

		it('Stop Command should show a notification with the correct text', async function () {
			this.timeout(30000);
			await stopAtlasMap();
			const notification = await driver.wait(() => getNotificationWithMessage(notifications.ATLASMAP_STOPPED), 20000);
			expect(await notification.getMessage()).contains(notifications.ATLASMAP_STOPPED);
		});

		it('Second Stop Command should show a notification with the correct text', async function () {
			this.timeout(30000);
			// ignore error
			await stopAtlasMap(20000).catch(() => undefined);
			await driver.wait(() => getNotificationWithMessage(notifications.ATLASMAP_UNABLE_LOCATE), 20000).catch(expect.fail);
		});
	});
}
