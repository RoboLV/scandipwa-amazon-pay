<?php
/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

namespace Robo\AmazonPay\Model\Resolver;

use Exception;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\Resolver\ContextInterface;
use Magento\Framework\GraphQl\Query\Resolver\Value;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Store\Model\ScopeInterface;

/**
 * Class GetConfigResolver
 * @package Robo\AmazonPay\Model\Resolver
 */
class GetConfigResolver implements ResolverInterface
{
    /**
     * @var ScopeConfigInterface
     */
    private $scopeConfig;

    /**
     * GetConfigResolver constructor.
     *
     * @param ScopeConfigInterface $scopeConfig
     */
    public function __construct(
        ScopeConfigInterface $scopeConfig
    ) {
        $this->scopeConfig = $scopeConfig;
    }

    /**
     * Fetches the data from persistence models and format it according to the GraphQL schema.
     *
     * @param Field $field
     * @param ContextInterface $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return mixed|Value
     * @throws Exception
     */
    public function resolve(Field $field, $context, ResolveInfo $info, array $value = null, array $args = null)
    {
        return [
            'widget_url' => $this->getConfigData('widget/' . $this->getMode() . '/' . $this->getRegion()) ?? '',
            'client_id' => $this->getConfigData('payment/amazon_payment/client_id'),
            'merchant_id' => $this->getConfigData('payment/amazon_payment/merchant_id'),
        ];
    }

    /**
     * Get payment region
     *
     * @return bool|mixed
     */
    protected function getRegion(): string
    {
        return $this->getConfigData('payment/amazon_payment/payment_region') ?? '';
    }

    /**
     * Get gateway working mode code
     *
     * @return string
     */
    protected function getMode(): string
    {
        return $this->getConfigData('payment/amazon_payment/sandbox') ? 'sandbox' : 'production';
    }

    /**
     * Get config data
     *
     * @param $path
     * @return bool|mixed
     */
    protected function getConfigData($path)
    {
        return $this->scopeConfig->getValue(
            $path,
            ScopeInterface::SCOPE_STORE
        );
    }
}
