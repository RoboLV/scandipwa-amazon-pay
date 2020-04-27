/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import React from 'react';

export const AMAZON_PAY = 'amazon_payment';

/**
 * Container
 */
export class CheckoutPaymentsContainerPlugin {
    /**
     * Payment data resolver
     *
     * @param originalMember
     * @param instance
     */
    dataMap(originalMember, instance) {
        instance.authorizeNetRef = React.createRef();

        /**
         * Get amazon response nonce
         */
        instance.getAmazonPayData = () => {
            return { asyncData: instance.amazonPayRef.current.getAsyncData() };
        };

        return {
            ...originalMember,
            [AMAZON_PAY]: instance.getAmazonPayData.bind(instance)
        };
    }

    /**
     * Add amazon to container methods
     *
     * @param originalMember
     * @param instance
     * @return {{setAmazonPayRef: *}}
     */
    containerFunctions(originalMember, instance) {
        /**
         * Set Amazon reference to the container
         *
         * @param ref
         */
        instance.setAmazonPayRef = (ref) => {
            instance.amazonPayRef = ref;
        };

        return {
            ...originalMember,
            setAmazonPayRef: instance.setAmazonPayRef.bind(instance)
        }
    }
}

const pluginContainer = new CheckoutPaymentsContainerPlugin();

const config = {
    'Component/CheckoutPayments/Container': {
        'class': {
            'construct': {
                'dataMap': [
                    {
                        position: 100,
                        implementation: pluginContainer.dataMap
                    }
                ],
                'containerFunctions': [
                    {
                        position: 100,
                        implementation: pluginContainer.containerFunctions
                    }
                ]
            }
        }
    }
};

export default config;
