import {useEffect, useRef} from "react";
import {MessageMap, MessageTargetHandler, MessageType} from "@typing/message";

import {Message} from "../providers";

export default <K extends MessageType<T>, T extends MessageMap = MessageMap>(
    type: K,
    handler: MessageTargetHandler<T, K>
): void => {
    const messageRef = useRef(new Message<T>());

    useEffect(() => {
        const unsubscribe = messageRef.current.watch(type, handler);

        return () => unsubscribe();
    }, [type, handler]);
}
