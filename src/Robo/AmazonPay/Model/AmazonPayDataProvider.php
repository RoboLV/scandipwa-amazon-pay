<?php
/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

namespace Robo\AmazonPay\Model;

use Magento\Checkout\Model\Session;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Exception\SessionException;
use Amazon\Payment\Api\Data\QuoteLinkInterfaceFactory;
use Magento\QuoteGraphQl\Model\Cart\Payment\AdditionalDataProviderInterface;
use Magento\Framework\Stdlib\ArrayManager;

/**
 * Class AmazonPayDataProvider
 * @package Robo\AmazonPay\Model
 */
class AmazonPayDataProvider implements AdditionalDataProviderInterface
{
    private const PATH_ADDITIONAL_DATA = 'amazon_payment';

    /**
     * @var ArrayManager
     */
    private $arrayManager;

    /**
     * @var QuoteLinkInterfaceFactory
     */
    private $quoteLinkFactory;

    /**
     * @var Session
     */
    private $session;

    /**
     * @param ArrayManager $arrayManager
     * @param QuoteLinkInterfaceFactory $quoteLinkFactory
     * @param Session $session
     */
    public function __construct(
        ArrayManager $arrayManager,
        QuoteLinkInterfaceFactory $quoteLinkFactory,
        Session $session
    ) {
        $this->arrayManager = $arrayManager;
        $this->quoteLinkFactory = $quoteLinkFactory;
        $this->session = $session;
    }

    /**
     * Return additional data
     *
     * @param array $data
     * @return array
     * @throws LocalizedException
     * @throws NoSuchEntityException
     * @throws SessionException
     */
    public function getData(array $data): array
    {
        $amazonData = $this->arrayManager->get(static::PATH_ADDITIONAL_DATA, $data) ?? [];
        $this->updateQuoteLink($amazonData);

        return $amazonData;
    }

    /**
     * Update amazon quote link as currently selected payment method is Amazon
     *
     * @param $amazonData
     * @throws SessionException
     * @throws LocalizedException
     * @throws NoSuchEntityException
     */
    protected function updateQuoteLink($amazonData): void
    {
        $amazonOrderReferenceId = $amazonData['amazon_order_reference_id'] ?? '';
        $quote = $this->session->getQuote();

        if (!$amazonOrderReferenceId) {
            throw new LocalizedException(__('Your amazon session expired, please reload the page and try again.'));
        }

        if (!$quote->getId()) {
            throw new SessionException(__('Your session has expired, please reload the page and try again.'));
        }

        $quoteLink = $this->quoteLinkFactory->create()->load($quote->getId(), 'quote_id');

        if ($quoteLink->getAmazonOrderReferenceId() !== $amazonOrderReferenceId) {
            $quoteLink
                ->setAmazonOrderReferenceId($amazonOrderReferenceId)
                ->setQuoteId($quote->getId())
                ->setConfirmed(false)
                ->save();
        }
    }
}
