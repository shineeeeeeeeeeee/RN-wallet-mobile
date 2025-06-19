// react custom hook file

import { useCallback, useState } from "react"
import { Alert } from "react-native";
import { API_URL } from "../constants/api";

// const API_URL = "https://rn-wallet-api-onq9.onrender.com/api"
// const API_URL = "http://localhost:5001/api"

export const useTransactions = (userId) => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        balance: 0,
        income: 0,
        expenses: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    // performance reasons use useCallback
    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/transactions/${userId}`);
            const data = await response.json();
    
            setTransactions(data);
    
            // ⬇️ Calculate summary here
            let income = 0;
            let expenses = 0;
    
            data.forEach((tx) => {
                const amount = parseFloat(tx.amount);
                if (tx.category === "income") income += amount;
                else if (tx.category === "expense") expenses += amount;
            });
    
            const balance = income - expenses;
            setSummary({ income, expenses, balance });
    
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }, [userId]);
    

    const loadData = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            await fetchTransactions(); // summary is calculated inside
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions, userId]);

    const deleteTransactions = async (id) => {
        try {
            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete transaction");
            }

            // Re-fetch data after deletion
            loadData();
            Alert.alert("Success", "Transaction deleted successfully");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Alert.alert("Error", error.message);
        }
    };

    return { transactions, summary, isLoading, loadData, deleteTransactions };

}