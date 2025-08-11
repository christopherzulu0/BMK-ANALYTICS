import { motion, useScroll, useTransform } from "framer-motion"
import { Card } from "../../../components/ui/card";

export default function InteractiveMap() {
    return (
        <>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mb-12"
            >
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">Interactive Pipeline Map</h2>
                <Card className="p-2 sm:p-4">
                    <div className="relative w-full" style={{ paddingBottom: "64%" }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m58!1m12!1m3!1d995159.9379155181!2d28.003017483791183!3d-13.013783670901741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m43!3e0!4m5!1s0x196cb4e3a782fdc7%3A0x540fdfe500034f23!2sNdola!3m2!1d-12.9906407!2d28.6498144!4m5!1s0x1910f0b3f1e08eb5%3A0x50ebe5d45dab1f1b!2sKalonje!3m2!1d-12.3769444!2d31.103726799999997!4m5!1s0x1905c0e078fa6067%3A0xb00b61909efa5880!2sChinsali!3m2!1d-10.5456373!2d32.0682044!4m5!1s0x1900a01e711399cd%3A0x4012f53f751f23a5!2sMbeya%2C%20Tanzania!3m2!1d-8.9094014!2d33.4607744!4m5!1s0x1854162bc11b2eb1%3A0x287d3378c421502f!2sIringa%2C%20Tanzania!3m2!1d-7.768059!2d35.6860723!4m5!1s0x185a5dc00cee7437%3A0xf0e8f2f705ae1dd1!2sMorogoro%2C%20Tanzania!3m2!1d-6.8277556!2d37.6591144!4m5!1s0x185c4b26738f08db%3A0x831c9e3fd473d341!2sKigamboni%2C%20Tanzania!3m2!1d-6.8226625!2d39.302446499999995!5e0!3m2!1sen!2szm!4v1754905502147!5m2!1sen!2szm" style="border:0;"  loading="lazy" 
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                        ></iframe>
                    </div>
                </Card>
            </motion.section>
        </>
    )
}