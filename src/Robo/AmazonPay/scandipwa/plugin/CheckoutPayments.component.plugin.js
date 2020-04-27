/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import React from 'react';

import AmazonPayPayment from '../app/component/AmazonPayPayment';
import {AMAZON_PAY} from 'CheckoutPayments.container.plugin';

/**
 * Container
 */
export class CheckoutPaymentsComponentPlugin {
    /**
     * Adjust validation
     *
     * @param originalMember
     * @param instance
     */
    paymentRenderMap(originalMember, instance) {
        /**
         * Render Amazon Pay
         */
        instance.renderAmazonPayPayment = () => {
            const { setOrderButtonVisibility, setAmazonPayRef } = instance.props;

            return (
                <AmazonPayPayment
                    setOrderButtonVisibility={ setOrderButtonVisibility }
                    setAmazonPayRef={ setAmazonPayRef }
                />
            );
        };

        return {
            ...originalMember,
            [AMAZON_PAY]: instance.renderAmazonPayPayment.bind(instance)
        }
    }
}

const pluginContainer = new CheckoutPaymentsComponentPlugin();

const config = {
    'Component/CheckoutPayments/Component': {
        'instance': {
            'get': {}
        },
        'class': {
            'construct': {
                'paymentRenderMap': [
                    {
                        position: 100,
                        implementation: pluginContainer.paymentRenderMap
                    }
                ]
            }
        }
    }
};

export default config;
