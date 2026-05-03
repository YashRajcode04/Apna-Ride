import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import './PaymentDemo.css';

const PaymentDemo = () => {
  const navigate = useNavigate();
  const [testAmount, setTestAmount] = useState(5000);
  const [testCardType, setTestCardType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const handleTestPayment = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    setLoading(true);

    try {
      const { data } = await API.post('/payments/test', {
        amount: testAmount,
        cardType: testCardType,
      });

      if (data.success) {
        setResponse({
          success: true,
          message: data.message,
          paymentId: data.paymentId,
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBookingPayment = async () => {
    // This would be used when creating a real booking
    setError('');
    setResponse(null);
    setLoading(true);

    try {
      // First, create a test booking (you would do this in the booking flow)
      // Then navigate to payment page with bookingId
      alert('In a real scenario, you would create a booking first, then navigate to the payment page');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-demo-container">
      <div className="demo-header">
        <h1>🎉 Demo Payment System</h1>
        <p>Simulate payment processing for the car rental application</p>
      </div>

      <div className="demo-content">
        {/* Payment Overview Section */}
        <section className="demo-section">
          <h2>Payment System Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Simulated Cards</h3>
              <p>Test success, failure, and decline scenarios</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Order Creation</h3>
              <p>Generates fake Razorpay order IDs</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Payment Verification</h3>
              <p>Simulates payment verification & confirmation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Status Tracking</h3>
              <p>Tracks payment status in booking system</p>
            </div>
          </div>
        </section>

        {/* Test Payment Section */}
        <section className="demo-section test-section">
          <h2>Test Payment API</h2>
          <form onSubmit={handleTestPayment} className="test-form">
            <div className="form-group">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                min="100"
                step="100"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardType">Card Type</label>
              <select
                id="cardType"
                value={testCardType}
                onChange={(e) => setTestCardType(e.target.value)}
                disabled={loading}
              >
                <option value="success">✓ Success (Approved)</option>
                <option value="fail">✗ Fail (Card Declined)</option>
                <option value="decline">⚠ Decline (Bank Decline)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Processing...' : 'Test Payment'}
            </button>
          </form>

          {error && <div className="error-box">{error}</div>}
          {response && (
            <div className="success-box">
              <h3>✅ {response.message}</h3>
              <div className="response-details">
                <p>
                  <strong>Payment ID:</strong> <code>{response.paymentId}</code>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Demo Cards Section */}
        <section className="demo-section">
          <h2>Demo Card Numbers</h2>
          <div className="cards-table">
            <div className="card-row header">
              <div className="card-col">Card Number</div>
              <div className="card-col">Type</div>
              <div className="card-col">Result</div>
            </div>
            <div className="card-row">
              <div className="card-col code">4111111111111111</div>
              <div className="card-col">Visa</div>
              <div className="card-col">✅ Success</div>
            </div>
            <div className="card-row">
              <div className="card-col code">5555555555554444</div>
              <div className="card-col">MasterCard</div>
              <div className="card-col">✅ Success</div>
            </div>
            <div className="card-row">
              <div className="card-col code">378282246310005</div>
              <div className="card-col">Amex</div>
              <div className="card-col">✅ Success</div>
            </div>
            <div className="card-row">
              <div className="card-col code">4000000000000002</div>
              <div className="card-col">Visa</div>
              <div className="card-col">✗ Declined</div>
            </div>
          </div>
        </section>

        {/* API Endpoints Section */}
        <section className="demo-section">
          <h2>API Endpoints</h2>
          <div className="endpoints-list">
            <div className="endpoint">
              <div className="method post">POST</div>
              <div className="path">/api/payments/test</div>
              <p>Test payment processing</p>
            </div>
            <div className="endpoint">
              <div className="method post">POST</div>
              <div className="path">/api/payments/order</div>
              <p>Create payment order for a booking</p>
            </div>
            <div className="endpoint">
              <div className="method post">POST</div>
              <div className="path">/api/payments/verify</div>
              <p>Verify payment and confirm booking</p>
            </div>
          </div>
        </section>

        {/* Integration Guide Section */}
        <section className="demo-section">
          <h2>Integration Guide</h2>
          <div className="guide-content">
            <h3>How to Integrate with Your Booking Flow:</h3>
            <ol>
              <li>
                <strong>Create Booking:</strong> User creates a booking with car details and dates
              </li>
              <li>
                <strong>Generate Payment Order:</strong> Call <code>/api/payments/order</code> with bookingId
              </li>
              <li>
                <strong>Show Payment Form:</strong> Display the Payment component with order details
              </li>
              <li>
                <strong>Process Payment:</strong> User enters card details and submits
              </li>
              <li>
                <strong>Verify Payment:</strong> Call <code>/api/payments/verify</code> to confirm
              </li>
              <li>
                <strong>Confirm Booking:</strong> Booking status changes to "confirmed" after payment
              </li>
            </ol>

            <h3>Example Usage:</h3>
            <pre className="code-block">
{`// In your booking creation flow:
import Payment from '../components/Payment';

const [showPayment, setShowPayment] = useState(false);

// After booking is created:
<Payment 
  bookingId={booking._id}
  totalPrice={booking.totalPrice}
  onSuccess={(updatedBooking) => {
    console.log('Booking confirmed:', updatedBooking);
    navigate('/my-bookings');
  }}
  onCancel={() => setShowPayment(false)}
/>`}
            </pre>
          </div>
        </section>

        {/* Summary Section */}
        <section className="demo-section summary-section">
          <h2>Summary</h2>
          <div className="summary-content">
            <h3>✨ What's Implemented:</h3>
            <ul>
              <li>✅ Fake payment order creation (simulates Razorpay)</li>
              <li>✅ Payment verification logic</li>
              <li>✅ Multiple card types for testing (success, fail, decline)</li>
              <li>✅ Booking status update after payment</li>
              <li>✅ Beautiful payment form UI</li>
              <li>✅ Demo API endpoints for testing</li>
            </ul>

            <h3>📝 Next Steps:</h3>
            <ul>
              <li>Integrate Payment component into CarDetails booking flow</li>
              <li>Add payment page route to App.jsx</li>
              <li>Connect payment to real booking workflow</li>
              <li>Add payment history to user dashboard</li>
              <li>Implement real Razorpay integration (replace fake endpoints)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentDemo;
