'use client';
import { useState, useEffect } from 'react';
import { useDynamicContext, useIsLoggedIn, useUserWallets } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'

interface DynamicMethodsProps {
	isDarkMode: boolean;
}

export default function DynamicMethods({ isDarkMode }: DynamicMethodsProps) {
	const isLoggedIn = useIsLoggedIn();
	const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
	const userWallets = useUserWallets();
	const [isLoading, setIsLoading] = useState(true);
	const [result, setResult] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);


	const safeStringify = (obj: unknown): string => {
		const seen = new WeakSet();
		return JSON.stringify(
			obj,
			(key, value) => {
				if (typeof value === "object" && value !== null) {
					if (seen.has(value)) {
						return "[Circular]";
					}
					seen.add(value);
				}
				return value;
			},
			2
		);
	};


	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (sdkHasLoaded && isLoggedIn && primaryWallet) {
			setIsLoading(false);
		} else {
			setIsLoading(true);
		}
	}, [sdkHasLoaded, isLoggedIn, primaryWallet]);

	function clearResult() {
		setResult('');
		setError(null);
	}

	function showUser() {
		try {
			setResult(safeStringify(user));
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stringify user data');
		}
	}

	function showUserWallets() {
		try {
			setResult(safeStringify(userWallets));
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stringify wallet data');
		}
	}


	async function fetchEthereumPublicClient() {
		if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
		try {
			setIsLoading(true);
			const result = await primaryWallet.getPublicClient();
			setResult(safeStringify(result));
		} catch (error) {
			setResult(safeStringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }));
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchEthereumWalletClient() {
		if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
		try {
			setIsLoading(true);
			const result = await primaryWallet.getWalletClient();
			setResult(safeStringify(result));
		} catch (error) {
			setResult(safeStringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }));
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchEthereumMessage() {
		if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
		try {
			setIsLoading(true);
			const result = await primaryWallet.signMessage("Hello World");
			setResult(safeStringify(result));
		} catch (error) {
			setResult(safeStringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{isMounted && !isLoading && (
				<div className={`p-5 transition-colors duration-300 ease-in-out flex flex-col items-center ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
					<div className="flex flex-wrap justify-center">
						<button className="px-4 py-2.5 m-1.5 border-none rounded cursor-pointer font-bold transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:opacity-80" onClick={showUser}>Fetch User</button>
						<button className="px-4 py-2.5 m-1.5 border-none rounded cursor-pointer font-bold transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:opacity-80" onClick={showUserWallets}>Fetch User Wallets</button>

						{primaryWallet && isEthereumWallet(primaryWallet) && (
							<>

								<button type="button" className="px-4 py-2.5 m-1.5 border-none rounded cursor-pointer font-bold transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:opacity-80" onClick={fetchEthereumPublicClient}>
									Fetch PublicClient
								</button>

								<button type="button" className="px-4 py-2.5 m-1.5 border-none rounded cursor-pointer font-bold transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:opacity-80" onClick={fetchEthereumWalletClient}>
									Fetch WalletClient
								</button>

								<button type="button" className="px-4 py-2.5 m-1.5 border-none rounded cursor-pointer font-bold transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:opacity-80" onClick={fetchEthereumMessage}>
									Fetch Message
								</button>
							</>
						)}
					</div>
					{(result || error) && (
						<div className="justify-center w-full max-w-4xl p-4 rounded bg-black bg-opacity-10 break-words overflow-x-auto">
							{error ? (
								<pre className="whitespace-pre-wrap break-words max-w-full text-red-600">{error}</pre>
							) : (
								<pre className="whitespace-pre-wrap break-words max-w-full">{result}</pre>
							)}
						</div>
					)}
					{(result || error) && (
						<div className="flex justify-center mt-2.5">
							<button className="px-4 py-2.5 m-1.5 border-none rounded cursor-pointer font-bold transition-colors duration-300 ease-in-out bg-blue-500 text-white hover:opacity-80" onClick={clearResult}>Clear</button>
						</div>
					)}
				</div>
			)}
		</>
	);
}