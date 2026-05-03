import { useState } from 'react';
import './Payment.css';
import API from '../utils/api';

const Payment = ({ bookingId, totalPrice, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4111111111111111', // Demo card
    cardName: 'John Doe',
    cardExpiry: '12/25',
    cardCVV: '123',
  });
  const [cardType, setCardType] = useState('success'); // success, fail, decline

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardTypeChange = (e) => {
    setCardType(e.target.value);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsProcessing(true);

    try {
      // Step 1: Create payment order
      const orderResponse = await API.post('/payments/order', {
        bookingId,
        amount: totalPrice,
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      const order = orderResponse.data.order;

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 2: Verify payment with fake payment ID
      const fakePaymentId = `pay_demo_${Date.now()}_${cardType}`;
      
      const verifyResponse = await API.post('/payments/verify', {
        bookingId,
        paymentId: fakePaymentId,
        orderId: order.id,
        signature: `sig_demo_${Date.now()}`,
      });

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || 'Payment verification failed');
      }

      setSuccess('✅ Payment successful! Your booking is confirmed.');
      setTimeout(() => {
        if (onSuccess) onSuccess(verifyResponse.data.booking);
      }, 2000);
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || err.message || 'Payment failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Payment Details</h2>
          <p className="booking-amount">Amount: ₹{totalPrice.toLocaleString('en-IN')}</p>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          {/* Test Card Selection */}
          <div className="form-section">
            <h3>Demo Card Type</h3>
            <div className="card-type-options">
              <label>
                <input
                  type="radio"
                  value="success"
                  checked={cardType === 'success'}
                  onChange={handleCardTypeChange}
                />
                ✓ Success Card (Works)
              </label>
              <label>
                <input
                  type="radio"
                  value="fail"
                  checked={cardType === 'fail'}
                  onChange={handleCardTypeChange}
                />
                ✗ Fail Card (Decline)
              </label>
              <label>
                <input
                  type="radio"
                  value="decline"
                  checked={cardType === 'decline'}
                  onChange={handleCardTypeChange}
                />
                ⚠ Decline Card (Bank Decline)
              </label>
            </div>
          </div>

          {/* Card Details */}
          <div className="form-section">
            <h3>Card Information</h3>
            
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={handleCardChange}
                disabled={isProcessing}
                maxLength="16"
              />
              <small className="demo-text">Demo Card: 4111111111111111</small>
            </div>

            <div className="form-group">
              <label htmlFor="cardName">Cardholder Name</label>
              <input
                id="cardName"
                type="text"
                name="cardName"
                placeholder="John Doe"
                value={cardDetails.cardName}
                onChange={handleCardChange}
                disabled={isProcessing}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Expiry Date</label>
                <input
                  id="cardExpiry"
                  type="text"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={cardDetails.cardExpiry}
                  onChange={handleCardChange}
                  disabled={isProcessing}
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cardCVV">CVV</label>
                <input
                  id="cardCVV"
                  type="text"
                  name="cardCVV"
                  placeholder="123"
                  value={cardDetails.cardCVV}
                  onChange={handleCardChange}
                  disabled={isProcessing}
                  maxLength="3"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Buttons */}
          <div className="payment-buttons">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary"
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${totalPrice.toLocaleString('en-IN')}`
              )}
            </button>
          </div>

          {/* Info Text */}
          <div className="payment-info">
            <p>
              <strong>Demo Mode:</strong> This is a simulated payment system for demonstration purposes.
              No real charges will be made.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
