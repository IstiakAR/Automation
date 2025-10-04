import { useState } from "react";

export const useMenubar = (cards) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const [filteredCards, setFilteredCards] = useState(cards);
    const [collapsedSections, setCollapsedSections] = useState({});

    const groupedCards = filteredCards.reduce((acc, card) => {
        if (!acc[card.section]) acc[card.section] = [];
        acc[card.section].push(card);
        return acc;
    }, {});

    const handleFilter = (e) => {
        setFilter(e.target.value.toLowerCase());
        const filtered = cards.filter(card =>
            card.name.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredCards(filtered);
    };

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleMenubar = () => {
        setIsOpen(prev => !prev);
    };

    return {
        isOpen,
        filter,
        groupedCards,
        collapsedSections,
        handleFilter,
        toggleSection,
        toggleMenubar
    };
};