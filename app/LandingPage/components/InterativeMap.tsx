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
                            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d62197.49611971988!2d28.620998457460377!3d-13.013783670901741!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x19134cdac31ee34d%3A0xe5a8535430a00d73!2sTazama%20Petroleum%20Products%20Ltd(NFT)%2C%20XM6P%2B7QF%2C%20Mafuta%20Road%2C%20Ndola!3m2!1d-13.0393046!2d28.686915799999998!4m5!1s0x196cb4e3a782fdc7%3A0x540fdfe500034f23!2sNdola!3m2!1d-12.9906407!2d28.6498144!5e0!3m2!1sen!2szm!4v1754857671782!5m2!1sen!2szm" style="border:0;"  loading="lazy" 
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