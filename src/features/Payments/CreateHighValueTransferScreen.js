import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAssets } from '../../context/AssetsContext';
import TraditionalPaymentFields from './TraditionalPaymentFields';
import OnChainPaymentFields from './OnChainPaymentFields';
import { renderError } from '../../utils/displayUtils';
import { sampleEntities } from '../../data/initialData';
import {
    settlementSpeeds, jurisdictions, traditionalRailsList, onChainNetworksList,
    baseGasFeeUSD, nativeTokenPricesUSD, ratesToUSD, ratesFromUSD,
    modalSamplePurposes as samplePurposes,
    institutionalRecipients
} from './data/paymentConstants';

const MIN_BALANCE_HVT_USD = 10000000;
const MIN_PAYMENT_HVT_USD = 10000000;

const PLATFORM_FEE_PERCENT = 0.0005;
const SLIPPAGE_FEE_PERCENT = 0.0008;
const CONTRACT_INTERACTION_FEE_USD = 0.02;
const PRIORITY_MULTIPLIER = 1.1;
const FX_SPREAD_PERCENT = 0.001;
const GENERIC_BANK_FEE_PERCENT = 0.0002;

const roundToTwoDecimals = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

const InformationCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

const CreateHighValueTransferScreen = ({ onBack, onPaymentSubmit, initialData = null }) => {

    const { assets } = useAssets();
    const [formStep, setFormStep] = useState('details');
    const [workflowState, setWorkflowState] = useState('idle');
    const [workflowMessage, setWorkflowMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [errors, setErrors] = useState({});
    const [paymentType, setPaymentType] = useState('traditional');
    const [paymentOrigin, setPaymentOrigin] = useState('institutional');
    const [senderEntity, setSenderEntity] = useState(sampleEntities[0] || '');
    const [senderAccountId, setSenderAccountId] = useState('');
    const [onBehalfOfName, setOnBehalfOfName] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientJurisdiction, setRecipientJurisdiction] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [recipientInstitution, setRecipientInstitution] = useState('');
    const [isManualRecipientEntry, setIsManualRecipientEntry] = useState(false);
    const [selectedRecipientPresetId, setSelectedRecipientPresetId] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const [traditionalRail, setTraditionalRail] = useState('');
    const [onChainNetwork, setOnChainNetwork] = useState('');
    const [settlementSpeed, setSettlementSpeed] = useState('standard');
    const [dateType, setDateType] = useState('immediate');
    const [scheduledDate, setScheduledDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [description, setDescription] = useState('');
    const [debitReference, setDebitReference] = useState('');

    const [previewData, setPreviewData] = useState({
        paymentAmount: 0, platformFee: 0, settlementFee: 0, networkFee: 0,
        slippageFee: 0, contractInteractionFee: 0, fxSpreadFee: 0, genericBankFee: 0,
        total: 0, currencySymbol: '', exchangeRate: null, receivedAmount: null,
        receivedCurrencySymbol: null, networkFeeDisplay: null
    });

    const accountsForOrigin = useMemo(() => {
        if (!Array.isArray(assets)) return [];
        return assets.filter(a =>
            paymentOrigin === 'client' ? !a.isInstitutional : (a.isInstitutional || a.isWizardIssued)
        );
    }, [paymentOrigin, assets]);

    const selectedSenderAsset = useMemo(() => {
        return accountsForOrigin.find(a => a.id === senderAccountId);
    }, [accountsForOrigin, senderAccountId]);

    const amountNumber = useMemo(() => parseFloat(amount) || 0, [amount]);

    const targetJurisdictionInfo = useMemo(() => jurisdictions.find(j => j.code === recipientJurisdiction), [recipientJurisdiction]);
    const targetCurrency = useMemo(() => paymentOrigin === 'client' && paymentType !== 'internal' ? targetJurisdictionInfo?.currency : currency, [paymentOrigin, paymentType, targetJurisdictionInfo, currency]);
    const exchangeRate = useMemo(() => {
        if (paymentOrigin !== 'client' || paymentType === 'internal' || !selectedSenderAsset || !targetCurrency || !ratesToUSD[selectedSenderAsset.symbol] || !ratesFromUSD[targetCurrency]) return null;
        if (selectedSenderAsset.symbol === targetCurrency) return 1;
        const sourceToUsdRate = ratesToUSD[selectedSenderAsset.symbol];
        const usdToTargetRate = ratesFromUSD[targetCurrency];
        return sourceToUsdRate * usdToTargetRate;
    }, [paymentOrigin, paymentType, selectedSenderAsset, targetCurrency]);

    const effectiveOnChainNetwork = useMemo(() => {
        if (paymentType !== 'on-chain') return null;
        if (paymentOrigin === 'institutional') return selectedSenderAsset?.blockchain;
        return onChainNetwork;
    }, [paymentType, paymentOrigin, selectedSenderAsset, onChainNetwork]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!senderAccountId) {
            newErrors.senderAccountId = 'Please select a source account.';
        } else if (selectedSenderAsset) {
            const rate = ratesToUSD[selectedSenderAsset.symbol] || 0;
            const usdEquivalent = selectedSenderAsset.balance * rate;
            if (usdEquivalent < MIN_BALANCE_HVT_USD) {
                newErrors.senderAccountId = `Account USD equivalent (${usdEquivalent.toLocaleString()}) is below the minimum required ($${MIN_BALANCE_HVT_USD.toLocaleString()}).`;
            }
        }
        if (paymentOrigin === 'institutional' && !isManualRecipientEntry && !selectedRecipientPresetId) newErrors.selectedRecipientPresetId = 'Please select a common recipient or choose manual entry.';
        else if ((paymentOrigin === 'institutional' && isManualRecipientEntry) || paymentOrigin === 'client') { if (!recipientAccount.trim()) newErrors.recipientAccount = 'Recipient identifier is required.'; }

        if (amountNumber <= 0) {
            newErrors.amount = 'Please enter a valid positive amount.';
        } else if (selectedSenderAsset && amountNumber > selectedSenderAsset.balance) {
            newErrors.amount = `Amount exceeds available balance (${selectedSenderAsset.balance.toLocaleString()}).`;
        } else if (currency) {
            const rate = ratesToUSD[currency] || 0;
            const usdPaymentAmount = amountNumber * rate;
            if (rate === 0) {
                 newErrors.amount = `Cannot verify minimum payment amount: Missing USD rate for ${currency}.`;
            } else if (usdPaymentAmount < MIN_PAYMENT_HVT_USD) {
                 newErrors.amount = `Amount must be at least $${MIN_PAYMENT_HVT_USD.toLocaleString()} USD equivalent (Entered value ≈ $${usdPaymentAmount.toLocaleString()} USD).`;
            }
        } else if (amountNumber > 0 && !currency) {
             newErrors.amount = 'Cannot verify minimum payment: Select source account first.';
        }

        if (paymentType === 'traditional' && !traditionalRail) newErrors.traditionalRail = 'Please select a payment rail.';
        if (paymentType === 'on-chain' && paymentOrigin === 'client' && !onChainNetwork) newErrors.onChainNetwork = 'Please select the destination network.';
        if (dateType === 'scheduled' && !scheduledDate) newErrors.scheduledDate = 'Please select a scheduled date.';
        if (!purpose) newErrors.purpose = 'Please select a purpose code.';
        if (paymentOrigin === 'client' && paymentType !== 'internal') {
            if (!recipientJurisdiction) {
                newErrors.recipientJurisdiction = 'Please select recipient jurisdiction.';
            } else if (!exchangeRate && selectedSenderAsset?.symbol !== targetCurrency) {
                 newErrors.recipientJurisdiction = 'FX rate unavailable or cannot be calculated for this pair.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [
        senderAccountId, selectedSenderAsset, paymentOrigin, isManualRecipientEntry, selectedRecipientPresetId,
        recipientAccount, recipientInstitution, amountNumber, currency,
        paymentType, traditionalRail, onChainNetwork, dateType, scheduledDate, purpose,
        recipientJurisdiction, exchangeRate, targetCurrency
    ]);

    const resetFieldsOnOriginOrTypeChange = useCallback(() => {
        if (initialData) return;
        setSenderAccountId(''); setOnBehalfOfName(''); setRecipientJurisdiction('');
        setTraditionalRail(''); setOnChainNetwork(''); setRecipientName('');
        setRecipientAccount(''); setRecipientInstitution(''); setIsManualRecipientEntry(false);
        setSelectedRecipientPresetId(''); setAmount(''); setCurrency('');
        setDescription('');
        setPurpose(''); setSettlementSpeed('standard'); setDateType('immediate');
        setScheduledDate(''); setDebitReference('');
        setErrors({});
    }, [initialData]);

    useEffect(() => {
        if (paymentOrigin === 'institutional' && !isManualRecipientEntry && selectedRecipientPresetId) {
            const preset = institutionalRecipients.find(p => p.id === selectedRecipientPresetId);
            if (preset && selectedRecipientPresetId !== '') {
                setRecipientName(preset.name);
                setRecipientAccount(preset.account);
                setRecipientInstitution(preset.institution);
                setErrors(prev => ({ ...prev, recipientAccount: null, selectedRecipientPresetId: null }));
            } else {
                setRecipientName(''); setRecipientAccount(''); setRecipientInstitution('');
            }
        }
    }, [selectedRecipientPresetId, isManualRecipientEntry, paymentOrigin]);

    useEffect(() => {
        if (paymentOrigin === 'institutional') {
             if (isManualRecipientEntry) {
                setSelectedRecipientPresetId('');
            } else {
                if (!selectedRecipientPresetId) {
                    setRecipientName(''); setRecipientAccount(''); setRecipientInstitution('');
                }
                setErrors(prev => ({ ...prev, selectedRecipientPresetId: null }));
            }
        }
        setErrors(prev => ({ ...prev, recipientAccount: null }));
    }, [isManualRecipientEntry, paymentOrigin, selectedRecipientPresetId]);

    useEffect(() => {
        resetFieldsOnOriginOrTypeChange();
        setIsManualRecipientEntry(paymentOrigin === 'client');
        setSelectedRecipientPresetId('');
    }, [paymentOrigin, resetFieldsOnOriginOrTypeChange]);

    useEffect(() => {
        if (!initialData) {
            resetFieldsOnOriginOrTypeChange();
            if (paymentOrigin === 'institutional') {
                setIsManualRecipientEntry(false);
                setSelectedRecipientPresetId('');
            }
        }
    }, [paymentType, initialData, resetFieldsOnOriginOrTypeChange, paymentOrigin]);

    useEffect(() => {
        const symbol = selectedSenderAsset?.symbol || '';
        setCurrency(symbol);
        if (errors.amount?.includes('exceeds available balance') && selectedSenderAsset && amountNumber <= selectedSenderAsset.balance) {
            setErrors(prev => ({ ...prev, amount: null }));
        }
        if (!selectedSenderAsset) setAmount('');
        if (paymentOrigin === 'client' && paymentType !== 'internal' && selectedSenderAsset && !ratesToUSD[selectedSenderAsset.symbol]) {
             setRecipientJurisdiction('');
             setErrors(prev => ({ ...prev, recipientJurisdiction: 'Selected source currency cannot be used for FX.' }));
        } else if (errors.recipientJurisdiction === 'Selected source currency cannot be used for FX.') {
             setErrors(prev => ({ ...prev, recipientJurisdiction: null }));
        }
     }, [selectedSenderAsset, paymentOrigin, paymentType, errors.amount, errors.recipientJurisdiction, amountNumber]);

    useEffect(() => {
        const isClientPayment = paymentOrigin === 'client';
        const sourceCurrencySymbol = selectedSenderAsset?.symbol || '';
        const sourceToUSDRate = ratesToUSD[sourceCurrencySymbol] || 1;
        const calculatedPreview = {
            paymentAmount: 0, platformFee: 0, settlementFee: 0, networkFee: 0,
            slippageFee: 0, contractInteractionFee: 0, fxSpreadFee: 0, genericBankFee: 0,
            total: 0, currencySymbol: sourceCurrencySymbol, exchangeRate: null,
            receivedAmount: null, receivedCurrencySymbol: null, networkFeeDisplay: null
         };

        if (amountNumber > 0 && sourceCurrencySymbol) {
            try {
                let tempPaymentAmount = amountNumber;
                let tempPlatformFee = tempPaymentAmount * PLATFORM_FEE_PERCENT;
                let tempSettlementFee = 0;
                let tempNetworkFee = 0;
                let tempSlippageFee = 0;
                let tempContractInteractionFee = 0;
                let tempFxSpreadFee = 0;
                let tempGenericBankFee = 0;
                let tempReceivedAmount = null;
                let tempNetworkFeeDisplay = null;
                let networkFeeSourceCurrency = 0;

                if (paymentType === 'on-chain') {
                    const network = effectiveOnChainNetwork;
                    if (network) {
                        const baseFeeUSD = baseGasFeeUSD[network] || baseGasFeeUSD.default;
                        const variability = 1 + (Math.random() * 0.1 - 0.05);
                        const totalNetworkInteractionFeeUSD = (baseFeeUSD * PRIORITY_MULTIPLIER) + CONTRACT_INTERACTION_FEE_USD;
                        networkFeeSourceCurrency = (totalNetworkInteractionFeeUSD / sourceToUSDRate) * variability;
                        tempNetworkFee = networkFeeSourceCurrency;
                        tempContractInteractionFee = (CONTRACT_INTERACTION_FEE_USD / sourceToUSDRate) * variability;
                        tempSlippageFee = tempPaymentAmount * SLIPPAGE_FEE_PERCENT;
                        const nativeSymbol = onChainNetworksList.find(n => n.code === network)?.nativeSymbol;
                        const nativePriceUSD = nativeTokenPricesUSD[nativeSymbol];
                        if (nativeSymbol && nativePriceUSD > 0) {
                            const nativeAmount = (totalNetworkInteractionFeeUSD / nativePriceUSD) * variability;
                            tempNetworkFeeDisplay = `${nativeAmount.toFixed(6)} ${nativeSymbol} (Est. Gas + Interaction)`;
                        } else {
                            tempNetworkFeeDisplay = `${roundToTwoDecimals(tempNetworkFee).toFixed(4)} ${sourceCurrencySymbol} (Est. Network Fees)`;
                        }
                    }
                }
                else if (paymentType === 'traditional') {
                    const speedData = settlementSpeeds[settlementSpeed];
                    tempSettlementFee = speedData ? tempPaymentAmount * speedData.feePercent : 0;
                    const railInfo = traditionalRailsList.find(r => r.code === traditionalRail);
                    if (railInfo) {
                        if (railInfo.feeType === 'flat') { networkFeeSourceCurrency = railInfo.fee || 0; }
                        else if (railInfo.feeType === 'percent') { networkFeeSourceCurrency = tempPaymentAmount * (railInfo.fee || 0); }
                        else { networkFeeSourceCurrency = 0; }
                        tempNetworkFee = networkFeeSourceCurrency;
                        tempNetworkFeeDisplay = `${roundToTwoDecimals(tempNetworkFee).toFixed(2)} ${sourceCurrencySymbol} (${railInfo?.name || 'Rail Fee'})`;
                    }
                    tempGenericBankFee = tempPaymentAmount * GENERIC_BANK_FEE_PERCENT;
                }

                if (isClientPayment && paymentType !== 'internal' && exchangeRate !== null && exchangeRate > 0 && targetCurrency) {
                    tempReceivedAmount = tempPaymentAmount * exchangeRate;
                    tempFxSpreadFee = tempPaymentAmount * FX_SPREAD_PERCENT;
                }

                let tempTotal = tempPaymentAmount + tempPlatformFee + tempSettlementFee + tempNetworkFee +
                                tempSlippageFee + tempFxSpreadFee + tempGenericBankFee;

                calculatedPreview.paymentAmount = roundToTwoDecimals(tempPaymentAmount);
                calculatedPreview.platformFee = roundToTwoDecimals(tempPlatformFee);
                calculatedPreview.settlementFee = roundToTwoDecimals(tempSettlementFee);
                calculatedPreview.networkFee = roundToTwoDecimals(tempNetworkFee);
                calculatedPreview.slippageFee = roundToTwoDecimals(tempSlippageFee);
                calculatedPreview.contractInteractionFee = roundToTwoDecimals(tempContractInteractionFee);
                calculatedPreview.fxSpreadFee = roundToTwoDecimals(tempFxSpreadFee);
                calculatedPreview.genericBankFee = roundToTwoDecimals(tempGenericBankFee);
                calculatedPreview.total = roundToTwoDecimals(tempTotal);
                calculatedPreview.exchangeRate = exchangeRate;
                calculatedPreview.receivedAmount = tempReceivedAmount !== null ? roundToTwoDecimals(tempReceivedAmount) : null;
                calculatedPreview.receivedCurrencySymbol = targetCurrency;
                calculatedPreview.networkFeeDisplay = tempNetworkFeeDisplay;

            } catch (error) { console.error("Error during preview calculation:", error); }
        }
        setPreviewData(calculatedPreview);
    }, [
        amountNumber, selectedSenderAsset, settlementSpeed, paymentType, paymentOrigin,
        exchangeRate, targetCurrency, traditionalRail, effectiveOnChainNetwork,
        currency
    ]);

    useEffect(() => {
      if (workflowState === 'pending_compliance') {
          setIsLoading(true);
          setWorkflowMessage('Running Compliance & KYC checks...');
          setTwoFactorCode('');
          setIsCodeSent(false);
          setTimeout(() => {
              const compliancePass = true; // <<< MODIFIED: Always pass for demo
              if (compliancePass) {
                  setWorkflowState('compliance_passed');
                  setIsLoading(false);
              } else {
                  // This 'else' block will now never be reached
                  setWorkflowState('compliance_failed');
                  setWorkflowMessage('Compliance Check Failed. Payment cannot proceed.');
                  setIsLoading(false);
              }
          }, 1500); // Reduced delay slightly for demo
      }
      else if (workflowState === 'compliance_passed') {
          setWorkflowState('pending_2fa');
          setWorkflowMessage('Compliance checks passed. Please complete Two-Factor Authentication.');
      }
      else if (workflowState === 'compliance_failed') {
          setIsLoading(false);
      }
      else if (workflowState === '2fa_passed') {
          setIsLoading(false);
          setWorkflowMessage('Authentication successful. Ready to submit for authorization.');
      }
      else if (workflowState === 'idle') {
          setWorkflowMessage('');
          setIsLoading(false);
          setTwoFactorCode('');
          setIsCodeSent(false);
      }
     }, [workflowState]);

     useEffect(() => {
        if (initialData && Array.isArray(assets) && assets.length > 0) {
            setRecipientName(initialData.recipientName || '');
            setRecipientAccount(initialData.recipientAccount || '');
            setRecipientInstitution(initialData.recipientInstitution || '');
            setAmount(initialData.amount ? String(initialData.amount) : '');
            setPurpose(initialData.purpose || '');
            setDescription(initialData.description || '');
            setOnBehalfOfName(initialData.onBehalfOfName || '');

            const labelToFind = initialData.fromAccountLabel;
            const senderAccount = assets.find(acc => acc.label === labelToFind);
            let determinedOrigin = initialData.paymentOrigin || 'institutional';

            if (senderAccount) {
                const rate = ratesToUSD[senderAccount.symbol] || 0;
                const usdEquivalent = senderAccount.balance * rate;
                if (usdEquivalent >= MIN_BALANCE_HVT_USD) {
                    setSenderAccountId(senderAccount.id);
                    determinedOrigin = senderAccount.isInstitutional ? 'institutional' : 'client';
                    setCurrency(senderAccount.symbol || '');
                } else {
                    console.warn(`HVT Init: Account "${labelToFind}" from template is below USD minimum.`);
                    alert(`Account "${labelToFind}" from template is below the required $${MIN_BALANCE_HVT_USD.toLocaleString()} USD equivalent for HVT and cannot be pre-selected.`);
                    setSenderAccountId('');
                    setCurrency('');
                }
            } else {
                console.warn("HVT Init: Could not find sender account from template:", labelToFind);
                setSenderAccountId('');
                setCurrency('');
            }
            setPaymentOrigin(determinedOrigin);

            const initialPaymentType = initialData.paymentType || 'traditional';
            setPaymentType(initialPaymentType);
            if (initialPaymentType === 'traditional') { setTraditionalRail(initialData.traditionalRail || ''); setSettlementSpeed(initialData.settlementSpeed || 'standard'); setOnChainNetwork(''); }
            else if (initialPaymentType === 'on-chain') { setOnChainNetwork(initialData.onChainNetwork || ''); setTraditionalRail(''); setSettlementSpeed('standard'); }
            else { setTraditionalRail(''); setOnChainNetwork(''); setSettlementSpeed('standard'); }

            setIsManualRecipientEntry(true);
            setSelectedRecipientPresetId('');
            setDateType('immediate'); setScheduledDate('');
            setDebitReference(initialData.debitReference || '');

            if (determinedOrigin === 'institutional') setSenderEntity(initialData.sendingEntity || sampleEntities[0] || '');
            else setSenderEntity('');

            setErrors({});
        }
     }, [initialData, assets]);


    const handleContinueToReview = (event) => {
        event.preventDefault();
        if (!validateForm()) {
            alert("Please correct errors and check amounts/balances.");
            return;
        }
        setErrors({});
        setFormStep('review');
        setWorkflowState('idle');
    };

    const handleProceedToWorkflow = () => {
        if (!validateForm()) {
            alert("Form data error. Please go back and review.");
            setFormStep('details');
            return;
        }
        setErrors({});
        setFormStep('confirm');
        setWorkflowState('pending_compliance');
    };

    const handleSend2FACode = () => { if (isLoading) return; setIsLoading(true); setWorkflowMessage('Sending 2FA code...'); setTimeout(() => { setIsCodeSent(true); setWorkflowMessage('Code sent (Simulated). Enter 123456.'); setIsLoading(false); }, 1000); };
    const handleVerify2FA = () => { if (isLoading) return; if (twoFactorCode === '123456') { setIsLoading(true); setWorkflowMessage('Code verified...'); setTimeout(() => { setWorkflowState('2fa_passed'); setIsLoading(false); }, 500); } else { alert('Incorrect code (Hint: 123456).'); setTwoFactorCode(''); } };
    const handleBackToDetails = () => { setFormStep('details'); setWorkflowState('idle'); setErrors({}); };
    const handleBackToReview = () => { setFormStep('review'); setWorkflowState('idle'); };

    const handleConfirmSubmit = () => {
        if (workflowState !== '2fa_passed') return;
        console.log('Submitting HVT payment for authorization...');
        const isClientPayment = paymentOrigin === 'client';
        const isTraditional = paymentType === 'traditional';
        const isOnChain = paymentType === 'on-chain';
        const simulatedFees = {
            platform: previewData.platformFee, settlement: previewData.settlementFee,
            networkOrRail: previewData.networkFee, slippage: previewData.slippageFee,
            contract: previewData.contractInteractionFee, fxSpread: previewData.fxSpreadFee,
            genericBank: previewData.genericBankFee,
        };

        const paymentAPIData = {
            _ui_payment_type: 'hvt',
            _ui_status: 'Pending Approval',
            _ui_payment_origin: paymentOrigin,
            destination_counterparty_info: {
                name: recipientName.trim() || undefined,
                accountIdentifier: recipientAccount.trim(),
                institution: recipientInstitution.trim() || undefined,
                ...(isClientPayment && paymentType !== 'internal' && { jurisdiction: recipientJurisdiction })
            },
            payment_source: {
                account_id: senderAccountId,
                account_label: selectedSenderAsset?.label || 'Unknown',
                ...(paymentOrigin === 'institutional' && { entity: senderEntity }),
                ...(paymentOrigin === 'institutional' && onBehalfOfName.trim() && { onBehalfOf: onBehalfOfName.trim() }),
                debit_reference: debitReference || undefined,
            },
            payment_info: {
                amount: amountNumber,
                currency: currency,
                purpose: purpose,
                description: description.trim() || undefined,
            },
            _ui_payment_type_selected: paymentType,
            ...(isTraditional && { _ui_settlement_speed: settlementSpeed, _ui_traditional_rail: traditionalRail }),
            ...(isOnChain && { _ui_onchain_network: effectiveOnChainNetwork }),
            _ui_date_type: dateType,
            _ui_scheduled_date: dateType === 'scheduled' ? scheduledDate : null,
            _simulated_fees: simulatedFees,
            _ui_network_fee_display: previewData.networkFeeDisplay,
            _simulated_total_debit: previewData.total,
            ...(isClientPayment && paymentType !== 'internal' && {
                _simulated_exchange_rate: previewData.exchangeRate,
                _simulated_recipient_amount: previewData.receivedAmount,
                _simulated_recipient_currency: previewData.receivedCurrencySymbol,
            })
        };

        if (typeof onPaymentSubmit === 'function') {
            onPaymentSubmit(paymentAPIData);
            alert(`HVT submitted successfully and is now pending authorization.`);
        } else {
            console.error("onPaymentSubmit prop is not a function!");
            alert("Error submitting HVT.");
        }
    };

    const renderReviewData = () => {
        const isTraditional = paymentType === 'traditional';
        const isOnChain = paymentType === 'on-chain';
        const isInternal = paymentType === 'internal';
        const effectiveSettlement = isTraditional ? (settlementSpeeds[settlementSpeed]?.label || settlementSpeed) : 'Instant';
        const senderLabel = selectedSenderAsset?.label ?? 'N/A';
        const senderSymbol = selectedSenderAsset?.symbol ?? '';
        const allFees = [
            { label: 'Platform Fee', value: previewData.platformFee }, { label: 'Settlement Fee', value: previewData.settlementFee }, { label: isOnChain ? 'Network Fee (Est.)' : 'Rail Fee', value: previewData.networkFee, display: previewData.networkFeeDisplay }, { label: 'Slippage (Est.)', value: previewData.slippageFee }, { label: 'Contract Fee (Est.)', value: previewData.contractInteractionFee, hide: previewData.networkFeeDisplay?.includes('Interaction') }, { label: 'FX Spread (Est.)', value: previewData.fxSpreadFee }, { label: 'Banking Fee (Est.)', value: previewData.genericBankFee },
        ].filter(fee => typeof fee.value === 'number' && fee.value > 0 && !fee.hide);
        const formatCurrency = (value, currency) => {
            if (typeof value !== 'number') return 'N/A';
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 6 : 2 }) + (currency ? ` ${currency}` : '');
        };

        return (
         <div className='p-4 border rounded bg-gray-50 mb-6 space-y-3 text-sm'>
            <h3 className="font-semibold text-base mb-3 border-b pb-2 text-gray-800">HVT Review Summary</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1">Origin & Type</div>
                <dt className="text-gray-500">Payment Origin:</dt><dd className="font-medium">{paymentOrigin === 'client' ? 'Client Payment' : 'Institutional Payment'}</dd>
                <dt className="text-gray-500">Payment Type:</dt><dd>{paymentType === 'on-chain' ? 'On-Chain' : paymentType === 'traditional' ? 'Traditional' : paymentType === 'internal' ? 'Internal Transfer' : 'N/A'}</dd>
                {isTraditional && <> <dt className="text-gray-500">Payment Rail:</dt> <dd>{traditionalRailsList.find(r=>r.code===traditionalRail)?.name || 'N/A'}</dd> </>}
                {isOnChain && <> <dt className="text-gray-500">Network:</dt> <dd>{onChainNetworksList.find(n=>n.code===effectiveOnChainNetwork)?.name || 'N/A'}</dd> </>}

                <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Sender Details</div>
                {paymentOrigin === 'institutional' && <> <dt className="text-gray-500">From Entity:</dt> <dd>{senderEntity || 'N/A'}</dd> </>}
                <dt className="text-gray-500">From Account:</dt><dd className="font-medium">{senderLabel} ({senderSymbol})</dd>
                {paymentOrigin === 'institutional' && onBehalfOfName && <> <dt className="text-gray-500">On Behalf Of:</dt> <dd>{onBehalfOfName}</dd> </>}

                <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Recipient Details</div>
                {paymentOrigin === 'client' && !isInternal && <> <dt className="text-gray-500">Recipient Jurisdiction:</dt> <dd>{targetJurisdictionInfo?.name ?? 'N/A'}</dd> </>}
                <dt className="text-gray-500">Recipient Name:</dt><dd>{recipientName || <span className="italic text-gray-500">Not Provided</span>}</dd>
                <dt className="text-gray-500">Recipient Account:</dt><dd className="break-all">{recipientAccount}</dd>
                {!isInternal && <> <dt className="text-gray-500">Recipient Institution/Network:</dt> <dd>{recipientInstitution || 'N/A'}</dd> </>}

                <div className="md:col-span-2 font-medium text-gray-700 border-b pb-1 mb-1 mt-2">Transfer Details</div>
                <dt className="text-gray-500">Amount to Send:</dt><dd className="font-semibold">{formatCurrency(previewData.paymentAmount, previewData.currencySymbol)}</dd>
                {paymentOrigin === 'client' && !isInternal && previewData.exchangeRate && previewData.receivedAmount !== null && ( <> <dt className="text-gray-500">Exchange Rate (Est.):</dt> <dd>1 {previewData.currencySymbol || ''} ≈ {(previewData.exchangeRate ?? 0).toFixed(4)} {previewData.receivedCurrencySymbol || ''}</dd> <dt className="text-gray-500 font-semibold">Recipient Receives (Est.):</dt> <dd className="font-semibold">{formatCurrency(previewData.receivedAmount, previewData.receivedCurrencySymbol)}</dd> </> )}
                <dt className="text-gray-500">Settlement Speed:</dt><dd>{effectiveSettlement}</dd>
                <dt className="text-gray-500">Payment Date:</dt><dd>{dateType === 'scheduled' ? scheduledDate : 'Immediate'}</dd>
                <dt className="text-gray-500">Purpose:</dt><dd>{purpose || 'N/A'}</dd>
                <dt className="text-gray-500">Description:</dt><dd>{description || <span className="italic text-gray-500">None</span>}</dd>

                <dt className="text-gray-500 pt-2 border-t md:col-span-2 font-semibold">Fees (Estimated):</dt>
                {allFees.length > 0 ? ( allFees.map((fee, index) => ( <React.Fragment key={index}> <dt className="text-gray-500 pl-4">{fee.label}:</dt> <dd className="font-medium"> {fee.display || formatCurrency(fee.value, previewData.currencySymbol)} </dd> </React.Fragment> )) ) : ( <> <dt className="text-gray-500 pl-4">Fees:</dt> <dd className="italic text-gray-500">None Estimated</dd> </> )}

                <div className="md:col-span-2 flex justify-between items-start pt-2 border-t mt-2"> <dt className="font-semibold text-gray-800">Total Estimated Debit:</dt> <dd className="font-semibold text-gray-800 text-base">{formatCurrency(previewData.total, previewData.currencySymbol)}</dd> </div>
           </dl>
         </div>
        );
    };

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Create New Payment (HVT Rules Applied)</h1>
        <button className="px-3 py-1 rounded text-white hover:opacity-90 bg-gray-800 text-sm" onClick={onBack}> Back </button>
      </div>

        <div className="flex items-start p-4 mb-6 text-sm text-blue-700 rounded-lg bg-blue-50 border border-blue-200" role="alert">
            <InformationCircleIcon />
            <div className="ml-3">
                <div className="font-medium">High-Value Transfer Policy:</div>
                <ul className="mt-1 list-disc list-inside">
                    <li>Initiating accounts must have ≥ ${MIN_BALANCE_HVT_USD.toLocaleString()} USD equivalent balance.</li>
                    <li>Payment amount must be ≥ ${MIN_PAYMENT_HVT_USD.toLocaleString()} USD equivalent.</li>
                    <li>Transfers over $10M require dual authorization.</li>
                    <li>Transfers over $50M require executive approval.</li>
                    <li>Compliance checks performed during confirmation.</li>
                    <li>Submitted transfers require authorization.</li>
                </ul>
            </div>
        </div>

       <div className="mb-8">
            <div className="flex items-center justify-between">
             {['Payment Details', 'Review', 'Confirm & Submit'].map((stepName, index) => {
               const stepValue = stepName.toLowerCase().split(' ')[0];
               const isActive = formStep === stepValue || (stepValue === 'payment' && formStep === 'details');
               const isCompleted = (formStep === 'review' && index < 1) || (formStep === 'confirm' && index < 2);
               return (
                 <React.Fragment key={stepName}>
                   <div className="w-1/3 text-center"> <div className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto transition-colors duration-300 ${ isCompleted ? 'bg-green-600 text-white' : (isActive ? 'bg-emtech-gold text-white' : 'bg-gray-200 text-gray-600') }`}> {isCompleted ? '✓' : index + 1} </div> <p className={`mt-1 text-sm transition-colors duration-300 ${isCompleted || isActive ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{stepName}</p> </div>
                   {index < 2 && ( <div className={`flex-1 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}></div> )}
                 </React.Fragment>
               );
             })}
           </div>
       </div>

      {formStep === 'details' && (
        <form onSubmit={handleContinueToReview}>
            <div className="mb-6">
                 <h2 className="font-medium mb-2 text-gray-800">Payment Origin <span className="text-red-600">*</span></h2>
                 <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-md overflow-hidden">
                     <button type="button" onClick={() => setPaymentOrigin('institutional')} className={`w-full px-4 py-2 text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${ paymentOrigin === 'institutional' ? 'bg-blue-700 text-white shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-100' }`} > Institutional Payment </button>
                     <button type="button" onClick={() => setPaymentOrigin('client')} className={`w-full px-4 py-2 text-center text-sm font-medium transition-colors duration-150 border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${ paymentOrigin === 'client' ? 'bg-blue-700 text-white shadow-inner' : 'bg-white text-gray-700 hover:bg-gray-100' }`} > Client Payment </button>
                 </div>
             </div>

             <div className="mb-6">
                 <h2 className="font-medium mb-3 text-gray-800">Payment Type <span className="text-red-600">*</span></h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'on-chain' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}>
                        <div className="flex items-center"> <input type="radio" name="paymentType" value="on-chain" checked={paymentType === 'on-chain'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">On-Chain Payments</p> <p className="text-xs text-gray-500">Using tokenized assets</p> </div> </div>
                    </label>
                    <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'traditional' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}>
                         <div className="flex items-center"> <input type="radio" name="paymentType" value="traditional" checked={paymentType === 'traditional'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Traditional Payments</p> <p className="text-xs text-gray-500">SWIFT / Bank Rails</p> </div> </div>
                     </label>
                     <label className={`border rounded p-3 cursor-pointer hover:shadow-md transition-shadow ${paymentType === 'internal' ? 'border-emtech-gold bg-yellow-50' : 'border-gray-300'}`}>
                         <div className="flex items-center"> <input type="radio" name="paymentType" value="internal" checked={paymentType === 'internal'} onChange={(e) => setPaymentType(e.target.value)} className="mr-2 h-4 w-4 text-emtech-gold focus:ring-emtech-gold"/> <div> <p className="font-medium text-sm">Internal Transfer</p> <p className="text-xs text-gray-500">Within platform</p> </div> </div>
                     </label>
                 </div>
             </div>

              <TraditionalPaymentFields
                   paymentType={paymentType} traditionalRail={traditionalRail} setTraditionalRail={setTraditionalRail}
                   settlementSpeed={settlementSpeed} setSettlementSpeed={setSettlementSpeed}
                   traditionalRailsList={traditionalRailsList} settlementSpeeds={settlementSpeeds}
                   error={errors.traditionalRail} clearError={() => setErrors(prev => ({ ...prev, traditionalRail: null }))}
               />
               <OnChainPaymentFields
                   paymentType={paymentType} paymentOrigin={paymentOrigin} selectedSenderAsset={selectedSenderAsset}
                   onChainNetwork={onChainNetwork} setOnChainNetwork={setOnChainNetwork}
                   onChainNetworksList={onChainNetworksList} error={errors.onChainNetwork}
                   clearError={() => setErrors(prev => ({ ...prev, onChainNetwork: null }))}
               />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6">
                <div>
                    <h2 className="font-medium mb-3 text-gray-800">From</h2>
                    <div className="space-y-4">
                        {paymentOrigin === 'institutional' && (
                            <div>
                                <label htmlFor="senderEntity" className="block mb-1 text-sm font-medium text-gray-700">Sending Entity <span className="text-red-600">*</span></label>
                                <select id="senderEntity" className="w-full p-2 border rounded bg-white text-sm border-gray-300" value={senderEntity} onChange={(e) => setSenderEntity(e.target.value)} required>
                                    {sampleEntities.map(entity => (<option key={entity} value={entity}>{entity}</option>))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor="senderAccount" className="block mb-1 text-sm font-medium text-gray-700"> {paymentOrigin === 'client' ? 'Client Account ' : 'Account/Wallet '} <span className="text-red-600">*</span> </label>
                            <select id="senderAccount" className={`w-full p-2 border rounded bg-white text-sm ${errors.senderAccountId ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100`} value={senderAccountId} onChange={(e) => {setSenderAccountId(e.target.value); setErrors(prev => ({ ...prev, senderAccountId: null }));}} required disabled={accountsForOrigin.length === 0} >
                                <option value="" disabled> {accountsForOrigin.length === 0 ? '-- No Suitable Accounts --' : '-- Select Source --'} </option>
                                {accountsForOrigin.map(asset => {
                                    const rate = ratesToUSD[asset.symbol] || 0;
                                    const usdEquivalent = asset.balance * rate;
                                    const isBelowMin = usdEquivalent < MIN_BALANCE_HVT_USD;
                                    let statusText = `(USD Equiv. below $${MIN_BALANCE_HVT_USD.toLocaleString()})`;
                                    if (rate === 0 && asset.balance > 0) { statusText = '(Cannot calculate USD value - Rate Missing)'; }
                                    return (
                                        <option key={asset.id} value={asset.id} disabled={isBelowMin} className={isBelowMin ? 'text-gray-400' : ''}>
                                            {asset.label} ({asset.balance.toLocaleString()} {asset.symbol})
                                            {isBelowMin && ` ${statusText}`}
                                        </option>
                                    );
                                })}
                            </select>
                            {renderError(errors.senderAccountId)}
                            {selectedSenderAsset && <p className="text-xs text-gray-500 mt-1">Selected Balance: {selectedSenderAsset.balance.toLocaleString()} {selectedSenderAsset.symbol}</p>}
                        </div>
                         <div>
                             <label htmlFor="hvt-amount" className="block mb-1 text-sm font-medium text-gray-700">Amount ({currency || '---'}) <span className="text-red-600">*</span></label>
                             <div className="flex">
                                 <input id="hvt-amount" type="number" min="0" step="any" className={`flex-1 p-2 border-l border-t border-b rounded-l text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'} disabled:bg-gray-100`} placeholder="Enter amount" value={amount} onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: null })); }} required disabled={!currency} />
                                 <span className={`inline-flex items-center px-3 p-2 border-r border-t border-b rounded-r border-l-0 bg-gray-100 text-gray-600 text-sm ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}> {currency || '---'} </span>
                             </div>
                             {renderError(errors.amount)}
                        </div>
                         {paymentOrigin === 'institutional' && (
                            <div>
                                <label htmlFor="onBehalfOfName" className="block mb-1 text-sm font-medium text-gray-700">On Behalf Of (Optional)</label>
                                <input id="onBehalfOfName" type="text" className="w-full p-2 border rounded text-sm border-gray-300" placeholder="e.g., Client Name, Department" value={onBehalfOfName} onChange={(e) => setOnBehalfOfName(e.target.value)} />
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-medium text-gray-800">To</h2>
                        {paymentOrigin === 'institutional' && (
                            <div className="flex items-center">
                                <span className={`text-xs mr-2 ${!isManualRecipientEntry ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>Use Preset</span>
                                <label htmlFor="manualEntryToggle" className="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="manualEntryToggle" className="sr-only peer" checked={isManualRecipientEntry} onChange={(e) => setIsManualRecipientEntry(e.target.checked)} /><div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></label>
                                <span className={`text-xs ml-2 ${isManualRecipientEntry ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>Enter Manually</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        {paymentOrigin === 'client' && paymentType !== 'internal' && (
                           <div>
                               <label htmlFor="recipientJurisdiction" className="block mb-1 text-sm font-medium text-gray-700">Recipient Jurisdiction <span className="text-red-600">*</span></label>
                               <select id="recipientJurisdiction" className={`w-full p-2 border rounded bg-white text-sm ${errors.recipientJurisdiction ? 'border-red-500' : 'border-gray-300'}`} value={recipientJurisdiction} onChange={(e) => {setRecipientJurisdiction(e.target.value); setErrors(prev => ({ ...prev, recipientJurisdiction: null }));}} required={paymentOrigin === 'client' && paymentType !== 'internal'} >
                                   {jurisdictions.map(j => (<option key={j.code} value={j.code} disabled={j.code === ''}>{j.name}</option>))}
                               </select>
                               {renderError(errors.recipientJurisdiction)}
                           </div>
                        )}
                        {paymentOrigin === 'institutional' && !isManualRecipientEntry && (
                            <div>
                                <label htmlFor="recipientPreset" className="block mb-1 text-sm font-medium text-gray-700">Common Institutional Client <span className="text-red-600">*</span></label>
                                <select id="recipientPreset" className={`w-full p-2 border rounded bg-white text-sm ${errors.selectedRecipientPresetId ? 'border-red-500' : 'border-gray-300'}`} value={selectedRecipientPresetId} onChange={(e) => { setSelectedRecipientPresetId(e.target.value); setErrors(prev => ({...prev, selectedRecipientPresetId: null }))}} required={!isManualRecipientEntry}>
                                    <option value="" disabled>-- Select Common Inst Client --</option>
                                    {institutionalRecipients.filter(p => p.id !== 'inst-rec-0').map(p => (<option key={p.id} value={p.id}>{p.name}{p.institution ? ` (${p.institution})` : ''}</option> ))}
                                </select>
                                {renderError(errors.selectedRecipientPresetId)}
                            </div>
                        )}
                        {(paymentOrigin === 'client' || (paymentOrigin === 'institutional' && isManualRecipientEntry)) && (
                            <>
                            <div>
                                <label htmlFor="recipientName" className="block mb-1 text-sm font-medium text-gray-700">Recipient Name</label>
                                <input id="recipientName" type="text" className="w-full p-2 border rounded text-sm border-gray-300" placeholder="Beneficiary name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="recipientAccount" className="block mb-1 text-sm font-medium text-gray-700">Recipient Identifier <span className="text-red-600">*</span></label>
                                <input id="recipientAccount" type="text" className={`w-full p-2 border rounded text-sm ${errors.recipientAccount ? 'border-red-500' : 'border-gray-300'} ${paymentOrigin === 'institutional' && !isManualRecipientEntry ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder={paymentType === 'internal' ? 'Internal Account/Wallet ID' : 'Account #, Wallet Addr, IBAN'} value={recipientAccount} onChange={(e) => {setRecipientAccount(e.target.value); setErrors(prev => ({ ...prev, recipientAccount: null }));}} required={paymentOrigin === 'client' || isManualRecipientEntry} disabled={paymentOrigin === 'institutional' && !isManualRecipientEntry} />
                                {renderError(errors.recipientAccount)}
                            </div>
                            {paymentType !== 'internal' &&
                                <div>
                                    <label htmlFor="recipientInst" className="block mb-1 text-sm font-medium text-gray-700"> Recipient {paymentType === 'traditional' ? 'Bank (SWIFT/BIC)' : 'Institution / Network'} </label>
                                    <input id="recipientInst" type="text" className={`w-full p-2 border rounded text-sm border-gray-300 ${paymentOrigin === 'institutional' && !isManualRecipientEntry ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} placeholder={paymentType === 'traditional' ? 'Enter SWIFT/BIC code' : 'e.g., Ethereum Mainnet'} value={recipientInstitution} onChange={(e) => setRecipientInstitution(e.target.value)} disabled={paymentOrigin === 'institutional' && !isManualRecipientEntry} />
                                </div>
                             }
                            </>
                        )}
                         {paymentOrigin === 'institutional' && !isManualRecipientEntry && selectedRecipientPresetId && selectedRecipientPresetId !== '' && (
                             <div className="mt-2 text-xs space-y-1 text-gray-600"> <p><span className="font-medium">Account:</span> {recipientAccount}</p> <p><span className="font-medium">Institution:</span> {recipientInstitution}</p> </div>
                         )}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                 <h2 className="font-medium mb-3 text-gray-800">Payment Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-4">
                        {(paymentType === 'traditional') && ( <div> <label className="block mb-1 text-sm font-medium text-gray-700">Settlement Speed</label> <input type="text" value={settlementSpeed === 'standard' ? 'Standard' : 'Priority/Express'} className="w-full p-2 border rounded bg-gray-100 text-sm border-gray-300" readOnly disabled/> </div> )}
                        {(paymentType === 'on-chain' || paymentType === 'internal') && ( <div> <label className="block mb-1 text-sm font-medium text-gray-700">Settlement Speed</label> <input type="text" value="Instant" className="w-full p-2 border rounded bg-gray-100 text-sm border-gray-300" readOnly disabled/> </div> )}
                        <div>
                            <label htmlFor="purpose" className="block mb-1 text-sm font-medium text-gray-700">Purpose <span className="text-red-600">*</span></label>
                            <select id="purpose" className={`w-full p-2 border rounded bg-white text-sm ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`} value={purpose} onChange={(e) => {setPurpose(e.target.value); setErrors(prev => ({ ...prev, purpose: null }));}} required >
                                {samplePurposes.map(p => (<option key={p} value={p === 'Select purpose code' ? '' : p} disabled={p === 'Select purpose code'}>{p}</option> ))}
                            </select>
                            {renderError(errors.purpose)}
                        </div>
                     </div>
                     <div className="space-y-4">
                         <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Payment Date</label>
                            <div className="flex space-x-2">
                                <div className="flex-1"><select className="w-full p-2 border rounded bg-white text-sm border-gray-300" value={dateType} onChange={(e) => {setDateType(e.target.value); if(e.target.value === 'immediate') { setErrors(prev => ({ ...prev, scheduledDate: null })); } }}> <option value="immediate">Immediate</option> <option value="scheduled">Scheduled</option> </select> </div>
                                <input type="date" className={`flex-1 p-2 border rounded text-sm ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'} ${dateType !== 'scheduled' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`} value={scheduledDate} onChange={(e) => {setScheduledDate(e.target.value); setErrors(prev => ({ ...prev, scheduledDate: null })); }} min={new Date().toISOString().split('T')[0]} disabled={dateType !== 'scheduled'} required={dateType === 'scheduled'} />
                            </div>
                             {renderError(errors.scheduledDate)}
                         </div>
                         <div>
                            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">Payment Description</label>
                            <textarea id="description" className="w-full p-2 border rounded text-sm border-gray-300" rows="2" placeholder="Payment notes or reference (optional)" value={description} onChange={(e) => setDescription(e.target.value)} ></textarea>
                         </div>
                     </div>
                 </div>
            </div>

           <div className="mt-6">
                 <h2 className="font-medium mb-3 text-gray-800">Preview (Estimated)</h2>
                 <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm">
                    <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Amount Sent:</span><span className="font-medium">{previewData.paymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {previewData.currencySymbol || ''}</span></div>
                        {paymentOrigin === 'client' && paymentType !== 'internal' && previewData.exchangeRate && previewData.receivedAmount !== null && ( <> <div className="flex justify-between"><span className="text-gray-600">FX Rate (Est.):</span><span className="text-xs">1 {previewData.currencySymbol || ''} ≈ {(previewData.exchangeRate ?? 0).toFixed(4)} {previewData.receivedCurrencySymbol || ''}</span></div> <div className="flex justify-between"><span className="text-gray-600">Received (Est.):</span><span className="font-medium">{previewData.receivedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.receivedCurrencySymbol || ''}</span></div> </> )}
                        <div className="pt-2 mt-2 border-t border-dashed">
                            <h4 className="font-semibold text-gray-700 mb-1">Estimated Fees:</h4>
                            { previewData.platformFee > 0 && <div className="flex justify-between"><span className="text-gray-600 pl-2">- Platform Fee:</span><span className="font-medium">{previewData.platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol}</span></div> }
                            { previewData.settlementFee > 0 && <div className="flex justify-between"><span className="text-gray-600 pl-2">- Settlement Fee:</span><span className="font-medium">{previewData.settlementFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol}</span></div> }
                            { previewData.networkFee > 0 && <div className="flex justify-between"><span className="text-gray-600 pl-2">- {paymentType === 'on-chain' ? 'Network Fee:' : 'Rail Fee:'}</span><span className="font-medium">{previewData.networkFeeDisplay ?? `${previewData.networkFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${previewData.currencySymbol}`}</span></div> }
                            { previewData.slippageFee > 0 && <div className="flex justify-between"><span className="text-gray-600 pl-2">- Slippage:</span><span className="font-medium">{previewData.slippageFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol}</span></div> }
                            { previewData.contractInteractionFee > 0 && !previewData.networkFeeDisplay?.includes('Interaction') && <div className="flex justify-between"><span className="text-gray-600 pl-2">- Contract Fee:</span><span className="font-medium">{previewData.contractInteractionFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol}</span></div> }
                            { previewData.fxSpreadFee > 0 && <div className="flex justify-between"><span className="text-gray-600 pl-2">- FX Spread:</span><span className="font-medium">{previewData.fxSpreadFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol}</span></div> }
                            { previewData.genericBankFee > 0 && <div className="flex justify-between"><span className="text-gray-600 pl-2">- Banking Fee:</span><span className="font-medium">{previewData.genericBankFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol}</span></div> }
                            { previewData.total === previewData.paymentAmount && previewData.platformFee <= 0 && previewData.settlementFee <= 0 && previewData.networkFee <= 0 && previewData.slippageFee <= 0 && previewData.fxSpreadFee <= 0 && previewData.genericBankFee <= 0 && <div className="text-gray-500 italic pl-2">None Estimated</div> }
                        </div>
                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold"> <span>Total Debit:</span> <span>{previewData.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {previewData.currencySymbol || ''}</span> </div>
                    </div>
                 </div>
            </div>

          <div className="mt-8 flex space-x-3 justify-end">
            <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={onBack} > Cancel </button>
            <button type="submit" className="px-4 py-2 rounded text-white hover:opacity-90 bg-emtech-gold disabled:opacity-50" >
              Continue to Review
            </button>
          </div>
        </form>
      )}

      {formStep === 'review' && (
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-800">Review Payment</h2>
          <p className="text-gray-600 mb-6">Please review the details below before proceeding to confirmation steps.</p>
          {renderReviewData()}
          <div className="mt-8 flex space-x-3 justify-between">
            <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} > Back to Edit </button>
            <button type="button" className="px-4 py-2 rounded text-white hover:opacity-90 bg-green-600" onClick={handleProceedToWorkflow}> Proceed to Confirm </button>
          </div>
        </div>
      )}

      {formStep === 'confirm' && (
         <div>
           <h2 className="text-xl font-medium mb-4 text-gray-800">Confirm & Submit Payment</h2>
           {renderReviewData()}
            <div className={`mt-6 p-4 border rounded-lg ${ workflowState === 'compliance_failed' ? 'bg-red-50 border-red-300': workflowState === '2fa_passed' ? 'bg-green-50 border-green-300': 'bg-blue-50 border-blue-300'}`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                        {isLoading ? (<svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : workflowState === 'compliance_passed' || workflowState === 'pending_2fa' ? (<div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center"><svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>
                        ) : workflowState === 'compliance_failed' ? (<div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center"><svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></div>
                        ) : workflowState === '2fa_passed' ? (<div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center"><svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg></div>
                        ) : null }
                    </div>
                    <div className="flex-grow">
                        <h3 className={`text-base font-semibold mb-1 ${ workflowState === 'compliance_failed' ? 'text-red-800' : workflowState === '2fa_passed' ? 'text-green-800' : 'text-blue-800' }`}>Confirmation Status</h3>
                        <p className={`text-sm ${ workflowState === 'compliance_failed' ? 'text-red-700' : 'text-gray-700' }`}> {workflowMessage || 'Initiating confirmation steps...'} </p>
                        {workflowState === 'pending_2fa' && !isLoading && (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-end space-x-3">
                                    <div className="flex-grow"><label htmlFor="hvt_2fa_code_confirm" className="block text-sm font-medium text-gray-700">Enter 2FA Code</label><input type="text" id="hvt_2fa_code_confirm" className="mt-1 w-full p-2 border rounded text-sm border-gray-300" placeholder="Enter 6-digit code (123456)" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} maxLength={6} disabled={!isCodeSent} /></div>
                                    <button type="button" className={`px-3 py-2 border rounded text-sm whitespace-nowrap ${!isCodeSent ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`} onClick={handleSend2FACode} disabled={isCodeSent || isLoading}>{isCodeSent ? 'Code Sent' : 'Send Code'}</button>
                                </div>
                                <button type="button" className="w-full px-4 py-2 rounded text-white hover:opacity-90 bg-blue-600 disabled:opacity-50" onClick={handleVerify2FA} disabled={!isCodeSent || twoFactorCode.length !== 6 || isLoading}> Verify Code </button>
                            </div> )}
                         {workflowState === '2fa_passed' && !isLoading && (
                             <div className="mt-4 pt-3 border-t border-gray-200">
                                 <button type="button" className="w-full px-4 py-2 rounded text-white hover:opacity-90 bg-green-700 font-semibold" onClick={handleConfirmSubmit} > Submit Payment for Authorization </button>
                             </div> )}
                         {workflowState === 'compliance_failed' && !isLoading && ( <p className="text-red-700 font-medium text-sm mt-2">Please review the payment details or contact support.</p> )}
                    </div>
                </div>
            </div>
           <div className="mt-8 flex space-x-3 justify-between">
             {(workflowState !== '2fa_passed' && !isLoading) && (<button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToReview} > Back to Review </button> )}
             <button type="button" className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50" onClick={handleBackToDetails} disabled={isLoading}> Cancel / Back to Edit </button>
           </div>
         </div>
      )}

    </div>
  );
};

export default CreateHighValueTransferScreen;