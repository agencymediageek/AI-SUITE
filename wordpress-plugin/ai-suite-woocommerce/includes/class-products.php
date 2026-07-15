<?php
/**
 * Creates and manages WooCommerce products for each AI Suite bundle.
 */
class AISuite_Products {

    // Plan definitions — each becomes a WooCommerce Simple Subscription product
    public static function get_plans(): array {
        return [
            [
                'slug'            => 'ai-suite-starter',
                'name'            => 'AI Suite — Starter',
                'description'     => '<p>Perfect for individuals exploring AI tools. Includes access to 50+ AI tools with 5,000 tokens per month.</p>',
                'price'           => '9.00',
                'period'          => 'month',
                'token_allowance' => 5000,
                'features'        => [ '5,000 tokens/month', '50+ AI tools', 'Email support', 'API access', 'Generation history' ],
                'categories'      => [ 'Writing', 'Social Media', 'Education', 'Creative' ],
            ],
            [
                'slug'            => 'ai-suite-pro',
                'name'            => 'AI Suite — Pro',
                'description'     => '<p>For power users and growing teams. Unlocks all 100+ tools with 25,000 tokens per month and N8N webhook integration.</p>',
                'price'           => '29.00',
                'period'          => 'month',
                'token_allowance' => 25000,
                'features'        => [ '25,000 tokens/month', '100+ AI tools', 'Priority support', 'N8N webhook integration', 'Advanced AI models', 'Usage analytics', 'Team tokens' ],
                'categories'      => [ 'All Tools', 'AI Agents', 'Development', 'Marketing', 'Business' ],
            ],
            [
                'slug'            => 'ai-suite-enterprise',
                'name'            => 'AI Suite — Enterprise',
                'description'     => '<p>Unlimited power for agencies and teams. Unlimited tokens, white-label option, dedicated support, and custom N8N workflows.</p>',
                'price'           => '99.00',
                'period'          => 'month',
                'token_allowance' => 999999,
                'features'        => [ 'Unlimited tokens', 'All AI tools + Agents', 'Dedicated support', 'Custom N8N workflows', 'White-label option', 'Admin dashboard', 'Team management', 'SLA guarantee' ],
                'categories'      => [ 'All Tools', 'Custom Workflows', 'White Label' ],
            ],
            // Individual tool bundle add-ons
            [
                'slug'            => 'ai-suite-writing-bundle',
                'name'            => 'AI Suite — Writing Bundle',
                'description'     => '<p>10 professional writing tools: Blog Post Generator, Article Writer, Content Improver, Grammar Check, Story Generator, and more.</p>',
                'price'           => '4.99',
                'period'          => 'month',
                'token_allowance' => 2000,
                'features'        => [ '2,000 tokens/month', 'Blog Post Generator', 'Article Writer', 'Content Improver', 'Grammar Check', 'Story Generator', 'Poem Generator', 'Headline Generator' ],
                'categories'      => [ 'Writing' ],
            ],
            [
                'slug'            => 'ai-suite-social-bundle',
                'name'            => 'AI Suite — Social Media Bundle',
                'description'     => '<p>Complete social media toolkit: Instagram Captions, Twitter Threads, LinkedIn Posts, YouTube Descriptions, and Hashtag Generator.</p>',
                'price'           => '4.99',
                'period'          => 'month',
                'token_allowance' => 2000,
                'features'        => [ '2,000 tokens/month', 'Instagram Captions', 'Twitter/X Threads', 'LinkedIn Posts', 'YouTube Descriptions', 'Hashtag Generator' ],
                'categories'      => [ 'Social Media' ],
            ],
            [
                'slug'            => 'ai-suite-dev-bundle',
                'name'            => 'AI Suite — Developer Bundle',
                'description'     => '<p>12 tools for developers: SQL Builder, Bug Fixer, Code Reviewer, API Docs, README Generator, Unit Test Generator, and more.</p>',
                'price'           => '7.99',
                'period'          => 'month',
                'token_allowance' => 3000,
                'features'        => [ '3,000 tokens/month', 'SQL Builder', 'Bug Fixer', 'Code Reviewer', 'API Docs Generator', 'README Generator', 'Unit Test Generator', 'Docker Compose', 'Regex Builder' ],
                'categories'      => [ 'Development' ],
            ],
            [
                'slug'            => 'ai-suite-business-bundle',
                'name'            => 'AI Suite — Business Bundle',
                'description'     => '<p>8 business tools: Business Plan Generator, Resume Builder, SWOT Analysis, Sales Pitch, Competitor Analysis, and more.</p>',
                'price'           => '6.99',
                'period'          => 'month',
                'token_allowance' => 2500,
                'features'        => [ '2,500 tokens/month', 'Business Plan Generator', 'Resume Builder', 'SWOT Analysis', 'Sales Pitch Writer', 'Competitor Analysis', 'Contract Generator', 'Pitch Deck Creator' ],
                'categories'      => [ 'Business' ],
            ],
        ];
    }

    /**
     * Creates all WooCommerce products on plugin activation.
     * Only creates products that don't already exist (checked by slug).
     */
    public static function create_all_products(): void {
        if ( ! class_exists( 'WC_Product_Simple' ) ) return;

        foreach ( self::get_plans() as $plan ) {
            if ( self::product_exists( $plan['slug'] ) ) continue;
            self::create_product( $plan );
        }
    }

    private static function product_exists( string $slug ): bool {
        $existing = get_page_by_path( $slug, OBJECT, 'product' );
        return $existing !== null;
    }

    private static function create_product( array $plan ): int {
        // Use Simple subscription if WooCommerce Subscriptions is active, else Simple
        $product_type = class_exists( 'WC_Product_Subscription' ) ? 'subscription' : 'simple';

        $product = $product_type === 'subscription'
            ? new WC_Product_Subscription()
            : new WC_Product_Simple();

        $product->set_name( $plan['name'] );
        $product->set_slug( $plan['slug'] );
        $product->set_description( $plan['description'] );
        $product->set_short_description( implode( ' | ', $plan['features'] ) );
        $product->set_regular_price( $plan['price'] );
        $product->set_status( 'publish' );
        $product->set_catalog_visibility( 'visible' );
        $product->set_virtual( true );

        // Subscription meta
        if ( $product_type === 'subscription' ) {
            update_post_meta( $product->get_id(), '_subscription_price',  $plan['price'] );
            update_post_meta( $product->get_id(), '_subscription_period', $plan['period'] );
            update_post_meta( $product->get_id(), '_subscription_period_interval', '1' );
        }

        $product_id = $product->save();

        // Save AI Suite meta
        update_post_meta( $product_id, '_aisuite_token_allowance', $plan['token_allowance'] );
        update_post_meta( $product_id, '_aisuite_plan_slug',       $plan['slug'] );
        update_post_meta( $product_id, '_aisuite_features',        $plan['features'] );

        return $product_id;
    }
}
