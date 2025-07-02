import {useEffect, useRef} from "react";
import {MessageDictionary, MessageTargetHandler, MessageType} from "@typing/message";

import {Message} from "../providers";

export default <K extends MessageType<T>, T extends MessageDictionary = MessageDictionary>(
    type: K,
    handler: MessageTargetHandler<T, K>
): void => {
    const messageRef = useRef(new Message<T>());

    useEffect(() => {
        const unsubscribe = messageRef.current.watch(type, handler);

        return () => unsubscribe();
    }, [type, handler]);
};
