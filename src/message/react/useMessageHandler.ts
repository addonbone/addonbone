import {useEffect, useRef} from "react";
import {MessageMap, MessageTargetHandler, MessageType} from "@typing/message";

import {Message} from "../providers";

function useMessageHandler<T extends MessageMap>(
    type: MessageType<T>,
    handler: MessageTargetHandler<T, MessageType<T>>
): void {

    const messageRef = useRef(new Message<T>());

    useEffect(() => {
        const unsubscribe = messageRef.current.watch(type, handler);

        return () => unsubscribe();
    }, [type, handler]);
}

export default useMessageHandler;
