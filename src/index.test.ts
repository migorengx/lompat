import { strict as assert } from "node:assert";
import Lompat, { add } from "./index";

export function testAdd() {
	assert.equal(add(1, 1), 2);
}

export function testLompat() {
    // Mocking the postMessage, addEventListener, and removeEventListener methods
    const postMessageMock = jest.fn();
    const addEventListenerMock = jest.fn();
    const removeEventListenerMock = jest.fn();

    // Creating a full window mock
	const windowMock: Window = {
        parent: {
            postMessage: postMessageMock,
            addEventListener: addEventListenerMock,
            removeEventListener: removeEventListenerMock,
        } as unknown as Window, // Change here: cast to `unknown` then `Window`
        postMessage: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    } as unknown as Window; // Change here: cast to `unknown` then `Window`

    const lompat = new Lompat(windowMock)
	lompat.start()
	lompat.send("test", () => {
		console.log("callback balik")
	})

	// Assertions to check if the methods are called correctly
	expect(addEventListenerMock).toHaveBeenCalled();
	expect(postMessageMock).toHaveBeenCalledWith(expect.anything());
}
