import { useState } from "react";
import Header from "./header";
import RedditStyleLayout from './content';

export default function PostFeed() {

    const [searchQuery, setSearchQuery] = useState("");
    const [searchByTitle, setSearchByTitle] = useState(true);
    const [triggerSearch, setTriggerSearch] = useState(false);
    const [top,settop] = useState(true);

    return (
        <>
            <Header searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchByTitle={searchByTitle}
                setSearchByTitle={setSearchByTitle}
                triggerSearch={triggerSearch}
                setTriggerSearch={setTriggerSearch}
                settop = {settop}
                top = {top} />

            <RedditStyleLayout searchQuery={searchQuery} triggerSearch={triggerSearch} title={searchByTitle} settop = {settop} top={top} />
        </>
    );
}