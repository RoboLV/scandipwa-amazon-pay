<?php
/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */
declare(strict_types=1);

namespace Robo\AmazonPay\Model\Cart;

use Magento\Checkout\Model\Session;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Exception\GraphQlNoSuchEntityException;
use Magento\Quote\Api\Data\PaymentInterface;
use Magento\Quote\Api\Data\PaymentInterfaceFactory;
use Magento\Quote\Api\PaymentMethodManagementInterface;
use Magento\Quote\Model\Quote;
use Magento\QuoteGraphQl\Model\Cart\Payment\AdditionalDataProviderPool;
use Magento\QuoteGraphQl\Model\Cart\SetPaymentMethodOnCart as CoreSetPaymentMethodOnCart;

/**
 * Set payment method on cart
 */
class SetPaymentMethodOnCart extends CoreSetPaymentMethodOnCart
{
    /**
     * @var PaymentMethodManagementInterface
     */
    private $paymentMethodManagement;

    /**
     * @var PaymentInterfaceFactory
     */
    private $paymentFactory;

    /**
     * @var AdditionalDataProviderPool
     */
    private $additionalDataProviderPool;

    /**
     * @var Session
     */
    private $session;

    /**
     * @param PaymentMethodManagementInterface $paymentMethodManagement
     * @param PaymentInterfaceFactory $paymentFactory
     * @param AdditionalDataProviderPool $additionalDataProviderPool
     * @param Session $session
     */
    public function __construct(
        PaymentMethodManagementInterface $paymentMethodManagement,
        PaymentInterfaceFactory $paymentFactory,
        AdditionalDataProviderPool $additionalDataProviderPool,
        Session $session
    ) {
        $this->paymentMethodManagement = $paymentMethodManagement;
        $this->paymentFactory = $paymentFactory;
        $this->additionalDataProviderPool = $additionalDataProviderPool;
        $this->session = $session;
    }

    /**
     * Set payment method on cart
     *
     * @param Quote $cart
     * @param array $paymentData
     * @throws GraphQlInputException
     * @throws GraphQlNoSuchEntityException
     */
    public function execute(Quote $cart, array $paymentData): void
    {
        if (!isset($paymentData['code']) || empty($paymentData['code'])) {
            throw new GraphQlInputException(__('Required parameter "code" for "payment_method" is missing.'));
        }
        $paymentMethodCode = $paymentData['code'];

        $this->session->replaceQuote($cart); // Fix for default magento quote processors

        $poNumber = $paymentData['purchase_order_number'] ?? null;
        $additionalData = $this->additionalDataProviderPool->getData($paymentMethodCode, $paymentData);

        $payment = $this->paymentFactory->create(
            [
                'data' => [
                    PaymentInterface::KEY_METHOD => $paymentMethodCode,
                    PaymentInterface::KEY_PO_NUMBER => $poNumber,
                    PaymentInterface::KEY_ADDITIONAL_DATA => $additionalData,
                ],
            ]
        );

        try {
            $this->paymentMethodManagement->set($cart->getId(), $payment);
        } catch (NoSuchEntityException $e) {
            throw new GraphQlNoSuchEntityException(__($e->getMessage()), $e);
        } catch (LocalizedException $e) {
            throw new GraphQlInputException(__($e->getMessage()), $e);
        }
    }
}
