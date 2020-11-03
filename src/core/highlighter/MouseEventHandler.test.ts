jest.dontMock("./MouseEventHandler");
jest.dontMock("../../Constants/ModifierKey");
jest.dontMock("../services/EventEmitter");
jest.dontMock("../services/Subscription");

import {ElementMeta, ElementWithMeta} from "../types";
import describeClassFromContainer from "@testFixtures/describeClassFromContainer";
import {MouseEventHandler} from "./MouseEventHandler";
import {getMockedInstance} from "@testFixtures/mocked";
import {Properties} from "../Properties";
import {ModifierKey} from "../../Constants/ModifierKey";

describe("MouseEventHandler", () => {
    const getMouseEventHandler = describeClassFromContainer(import("./MouseEventHandler"), "MouseEventHandler");
    let mouseEventHandler: ReturnType<typeof getMouseEventHandler>;
    let mockedElement: ElementWithMeta;
    const key = "Alt";
    const mockedColor = "rgb(0, 30, 50)"

    const mockedCallback = jest.fn();
    const mockedClick = new MouseEvent("click");
    const mockedMouseOver = new MouseEvent("mouseover");
    const mockedMouseLeave = new MouseEvent("mouseleave");
    const mockedKeydown = new KeyboardEvent("keydown", {key});
    const mockedKeyup = new KeyboardEvent("keyup", {key});

    beforeEach(async () => {
        mouseEventHandler = await getMouseEventHandler();
        mockedElement = document.createElement("div") as Element as ElementWithMeta;
        mockedElement._polygloat = {} as ElementMeta;
        mouseEventHandler.handle(mockedElement, mockedCallback);
        getMockedInstance(Properties).config.highlightKeys = [ModifierKey[key]];
        getMockedInstance(Properties).config.highlightColor = mockedColor;
        mockedElement.dispatchEvent(mockedMouseOver);
        window.dispatchEvent(mockedKeydown);
    });

    describe("highlighting", () => {

        test("Will highlight", async () => {
            expect(mockedElement.style.backgroundColor).toEqual(mockedColor);
        });


        test("Will unhighlight", async () => {
            mockedElement.dispatchEvent(mockedMouseLeave);
            expect(mockedElement.style.backgroundColor).toEqual("");
        });

        test("Will reset to correct initial color", async () => {
            mockedElement.dispatchEvent(mockedMouseLeave);
            mockedElement.style.backgroundColor = "#222222"
            mockedElement.dispatchEvent(mockedMouseOver);
            mockedElement.dispatchEvent(mockedMouseLeave);
            expect(mockedElement.style.backgroundColor).toEqual("rgb(34, 34, 34)");
        });

        test("Will not highlight just on mouseover", async () => {
            mockedElement.dispatchEvent(mockedMouseLeave);
            window.dispatchEvent(mockedKeyup);
            mockedElement.dispatchEvent(mockedMouseOver);
            expect(mockedElement.style.backgroundColor).toEqual("");
        });

        test("Will not highlight just on keydown", async () => {
            window.dispatchEvent(mockedKeyup);
            mockedElement.dispatchEvent(mockedMouseLeave);
            window.dispatchEvent(mockedKeydown)
            expect(mockedElement.style.backgroundColor).toEqual("");
        });


        test("Will highlight when keydown first", async () => {
            window.dispatchEvent(mockedKeyup);
            mockedElement.dispatchEvent(mockedMouseLeave);
            window.dispatchEvent(mockedKeydown);
            mockedElement.dispatchEvent(mockedMouseOver);
            expect(mockedElement.style.backgroundColor).toEqual(mockedColor);
        });

        test("Will not handle single element multiple times", async () => {
            console.error = jest.fn();
            mouseEventHandler.handle(mockedElement, () => {});
            mouseEventHandler.handle(mockedElement, () => {});

            expect(console.error).toBeCalledTimes(2);
            mockedElement.dispatchEvent(mockedClick);
            expect(mockedCallback).toBeCalledTimes(1);
        });

        test("Will clear keys on window blur", async () => {
            window.dispatchEvent(new Event("blur"));
            mockedElement.dispatchEvent(mockedClick);
            expect(mockedCallback).not.toBeCalledTimes(1);
        });
    });

    describe("click", () => {
        test("Will call callback on click", async () => {
            mockedElement.dispatchEvent(mockedClick);
            expect(mockedCallback).toBeCalledTimes(1);
        });
    })

    describe("Remove all listeners callback", () => {
        test("will be assigned on init", () => {
            expect(typeof mockedElement._polygloat.removeAllEventListeners).toEqual("function");
        });

        test("will not handle click after it's call", () => {
            mockedElement._polygloat.removeAllEventListeners();
            mockedElement.dispatchEvent(mockedClick);
            expect(mockedCallback).toBeCalledTimes(0);
        })

        test("will not handle mouse over after it's call", () => {
            mockedElement._polygloat.removeAllEventListeners();
            mockedElement.dispatchEvent(mockedMouseOver);
            expect(mockedCallback).toBeCalledTimes(0);
        })

        test("will not handle mouse leave after it's call", () => {
            mockedElement._polygloat.removeAllEventListeners();
            mockedElement.dispatchEvent(mockedMouseLeave);
            expect(mockedCallback).toBeCalledTimes(0);
        })
    })

});