import {renderHook} from '@testing-library/react';
import useMessageHandler from './useMessageHandler';
import {Message} from '../providers';

const mockWatch = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('../providers', () => ({
    Message: jest.fn().mockImplementation(() => ({
        watch: mockWatch,
    })),

}));

beforeEach(() => {
    mockWatch.mockClear();
    mockUnsubscribe.mockClear();
});

test('should call Message.watch with correct arguments', () => {
    const handler = jest.fn();
    mockWatch.mockReturnValue(mockUnsubscribe);

    renderHook(() => useMessageHandler('getStringLength', handler));

    expect(Message).toHaveBeenCalledTimes(1);
    expect(mockWatch).toHaveBeenCalledWith('getStringLength', handler);
});

test('should unsubscribe on unmount', () => {
    mockWatch.mockReturnValue(mockUnsubscribe);

    const handler = jest.fn();
    const {unmount} = renderHook(() =>
        useMessageHandler('getStringLength', handler)
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
});

test('should update subscription when type or handler changes', () => {
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    const {rerender} = renderHook(
        ({type, handler}) => useMessageHandler(type, handler),
        {
            initialProps: {type: 'getStringLength', handler: firstHandler},
        }
    );

    expect(mockWatch).toHaveBeenCalledWith('getStringLength', firstHandler);

    mockWatch.mockClear();
    mockUnsubscribe.mockClear();
    mockWatch.mockReturnValue(mockUnsubscribe);

    rerender({type: 'toUpperCase', handler: secondHandler});

    expect(mockWatch).toHaveBeenCalledWith('toUpperCase', secondHandler);
});
